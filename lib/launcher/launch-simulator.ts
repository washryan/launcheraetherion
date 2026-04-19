/**
 * Simulador do pipeline de launch — usado no preview.
 *
 * No Electron, o Dashboard chama `window.aetherion.launch({ ... })` e recebe
 * os mesmos eventos `LaunchProgress` via IPC. Aqui simulamos o fluxo com
 * timers para que o preview mostre a UX real (barra, fases, % , contagem).
 *
 * O importante: a FORMA dos eventos é idêntica à do main process real.
 */

import type { LaunchPhase, LaunchProgress, Manifest } from "./types"
import { computeUpdatePlan } from "./manifest"
import { MOCK_MANIFEST } from "./mock-data"

interface SimulateOptions {
  onProgress: (p: LaunchProgress) => void
  signal?: AbortSignal
  /** Se true, força uma falha em "downloading-files" para testar o erro UI */
  forceError?: boolean
}

export async function simulateLaunch(opts: SimulateOptions): Promise<void> {
  const { onProgress, signal } = opts
  const manifest = MOCK_MANIFEST

  const step = async (
    phase: LaunchPhase,
    message: string,
    duration = 600,
    extra: Partial<LaunchProgress> = {},
  ) => {
    if (signal?.aborted) throw new DOMException("Cancelado", "AbortError")
    onProgress({ phase, message, ...extra })
    await sleep(duration, signal)
  }

  await step("fetching-manifest", "Buscando manifest.json no GitHub Pages...", 700)
  await step(
    "computing-plan",
    `Manifest v${manifest.version} — comparando com estado local...`,
    500,
  )

  // Simula um plano: primeira vez instalando, tudo para baixar
  const plan = computeUpdatePlan({
    manifest,
    local: {
      instanceId: manifest.instanceId ?? "aetherion-main",
      installedManifestVersion: null,
      enabledOptionalMods: {},
      dropinMods: [],
    },
    installedHashes: {},
  })

  await step("checking-java", "Procurando Java 17 no sistema...", 500)
  await step("downloading-java", "Java 17 encontrado (Temurin). Pulando download.", 400)

  if (plan.needsForgeInstall) {
    await step("installing-forge", `Instalando Forge ${manifest.forge.version}...`, 900)
  }

  // Fase de downloads com progresso real baseado no plano
  const totalBytes = plan.totalBytes
  const filesTotal = plan.downloadCount
  let loadedBytes = 0
  let filesDone = 0

  const downloads = plan.actions.filter(
    (a): a is Extract<(typeof plan.actions)[number], { kind: "download" }> =>
      a.kind === "download" && a.category !== "forge",
  )

  for (const action of downloads) {
    if (signal?.aborted) throw new DOMException("Cancelado", "AbortError")

    // Simula download em 3 "ticks" por arquivo
    const chunk = action.size / 3
    for (let i = 0; i < 3; i++) {
      await sleep(120 + Math.random() * 180, signal)
      loadedBytes += chunk
      onProgress({
        phase: "downloading-files",
        message: `Baixando ${displayName(action.path)}...`,
        totalBytes,
        loadedBytes: Math.min(loadedBytes, totalBytes),
        filesDone,
        filesTotal,
      })
    }
    filesDone++

    // Dispara um erro de exemplo em 20% do caminho quando pedido
    if (opts.forceError && filesDone === Math.ceil(filesTotal * 0.3)) {
      throw new Error(
        `HashMismatchError: SHA-256 não confere para ${action.path}\n` +
          `  esperado: ${action.sha256.slice(0, 16)}...\n` +
          `  recebido: 000000000000...`,
      )
    }
  }

  await step(
    "verifying",
    `${filesTotal} arquivos baixados. Verificando integridade...`,
    700,
    { totalBytes, loadedBytes: totalBytes, filesDone: filesTotal, filesTotal },
  )
  await step("launching", "Iniciando processo javaw...", 600)
  onProgress({ phase: "running", message: "Minecraft em execução" })
}

/* -------------------------------------------------------------------------- */

function displayName(path: string): string {
  return path.split("/").pop() ?? path
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Cancelado", "AbortError"))
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id)
        reject(new DOMException("Cancelado", "AbortError"))
      },
      { once: true },
    )
  })
}

/** Exportado para quem quiser usar o manifest em outras telas */
export { MOCK_MANIFEST as PREVIEW_MANIFEST }
export type { Manifest }
