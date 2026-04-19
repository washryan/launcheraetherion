/**
 * Aetherion Launcher — Java Runtime (Fase 4)
 *
 * Regras de decisão puras. A execução real (spawn, fs.exists, tar xzf)
 * acontece no main process do Electron.
 *
 * Estratégia:
 *   1) Listar Java candidates (main process → filesystem + PATH + JAVA_HOME)
 *   2) Rodar `java -version` em cada → extrair major version
 *   3) Esta lib escolhe o melhor match para o manifest
 *   4) Se nenhum serve, esta lib monta o plano de download
 */

import type { JavaInstallation, JavaPlan, Manifest, PlatformKey } from "./types"

/**
 * Escolhe a melhor instalação Java já presente no sistema.
 *
 * Preferência (em ordem):
 *   1) Major igual ao recomendado (17 para 1.19.2, 8 para 1.7.10)
 *   2) Major >= minMajor
 *   3) Arquitetura x64 antes de x86
 *   4) Vendor Temurin/Adoptium > Oracle > outros (estabilidade no MC)
 */
export function pickBestJava(
  installations: JavaInstallation[],
  manifest: Manifest,
): JavaInstallation | null {
  const { recommendedMajor, minMajor } = manifest.java

  const compatible = installations.filter((j) => j.major >= minMajor)
  if (compatible.length === 0) return null

  return compatible.sort((a, b) => {
    // 1) Match exato do recomendado vence
    const aExact = a.major === recommendedMajor ? 0 : 1
    const bExact = b.major === recommendedMajor ? 0 : 1
    if (aExact !== bExact) return aExact - bExact

    // 2) Menor major acima do mínimo (mais próximo do target)
    const aDist = Math.abs(a.major - recommendedMajor)
    const bDist = Math.abs(b.major - recommendedMajor)
    if (aDist !== bDist) return aDist - bDist

    // 3) 64 bits primeiro
    if (a.arch !== b.arch) return a.arch === "x64" ? -1 : 1

    // 4) Vendor score
    return vendorScore(b.vendor) - vendorScore(a.vendor)
  })[0]
}

function vendorScore(vendor: string): number {
  const v = vendor.toLowerCase()
  if (v.includes("temurin") || v.includes("adoptium") || v.includes("eclipse")) return 3
  if (v.includes("oracle")) return 2
  if (v.includes("openjdk") || v.includes("zulu") || v.includes("corretto")) return 2
  return 1
}

/**
 * Se nenhuma Java local serve, retorna o plano para baixar a runtime
 * embutida do manifest. A plataforma é detectada pelo main process.
 */
export function planJavaDownload(
  manifest: Manifest,
  platform: PlatformKey,
): JavaPlan {
  const runtime = manifest.java.runtimes[platform]
  if (!runtime) {
    return {
      action: "error",
      message: `Nenhuma runtime Java disponível para ${platform} neste manifest.`,
    }
  }
  return {
    action: "download",
    url: runtime.url,
    sha256: runtime.sha256,
    size: runtime.size,
    target: `runtimes/java-${manifest.java.recommendedMajor}-${platform}`,
  }
}

/**
 * Decisão de alto nível: usar instalação local ou baixar.
 */
export function resolveJava(
  installations: JavaInstallation[],
  manifest: Manifest,
  platform: PlatformKey,
): JavaPlan {
  const best = pickBestJava(installations, manifest)
  if (best) {
    return {
      action: "use-local",
      installation: best,
    }
  }
  return planJavaDownload(manifest, platform)
}
