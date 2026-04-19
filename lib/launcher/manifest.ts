/**
 * Aetherion Launcher — Manifest & Updater (Fase 3)
 *
 * Biblioteca pura de domínio. A implementação de download e hashing
 * é injetada pelo main process (Node) — aqui ficam as regras de negócio:
 *   - fetch do manifest remoto
 *   - comparação com o estado local da instância
 *   - plano de ações (baixar, remover, manter, pular)
 *
 * O plano gerado por `computeUpdatePlan` é passado para um executor
 * concorrente no main (p-limit + sha256 streaming).
 */

import type {
  LocalInstanceState,
  Manifest,
  ModEntry,
  UpdateAction,
  UpdatePlan,
} from "./types"

/* -------------------------------------------------------------------------- */
/*  Fetch & validação                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Busca o manifest remoto com cache-busting por query string.
 * Lança se o status não for 200 ou se o JSON não tiver os campos mínimos.
 */
export async function fetchManifest(url: string, signal?: AbortSignal): Promise<Manifest> {
  const cacheBust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
  const res = await fetch(cacheBust, {
    signal,
    headers: { Accept: "application/json" },
  })
  if (!res.ok)
    throw new Error(`Falha ao buscar manifest (${res.status} ${res.statusText})`)

  const json = (await res.json()) as Manifest
  if (!json.manifestVersion || !json.minecraft?.version)
    throw new Error("Manifest inválido: campos obrigatórios ausentes.")

  return json
}

/**
 * Valida que o launcher atual suporta a versão do manifest.
 */
export function isLauncherCompatible(
  manifest: Manifest,
  launcherVersion: string,
): boolean {
  if (!manifest.requiredLauncherVersion) return true
  return semverGte(launcherVersion, manifest.requiredLauncherVersion)
}

/* -------------------------------------------------------------------------- */
/*  Cálculo do plano de atualização                                           */
/* -------------------------------------------------------------------------- */

export interface ComputePlanInput {
  manifest: Manifest
  /** Estado local persistido em instance-state.json */
  local: LocalInstanceState
  /**
   * Mapa filename → sha256 dos arquivos realmente presentes em disco.
   * O main process escaneia a pasta `mods/` e passa o resultado.
   */
  installedHashes: Record<string, string>
}

export function computeUpdatePlan(input: ComputePlanInput): UpdatePlan {
  const { manifest, local, installedHashes } = input
  const actions: UpdateAction[] = []

  // 1) Mods obrigatórios — sempre presentes no hash certo
  for (const mod of manifest.categories.required) {
    actions.push(resolveFileAction(mod, installedHashes, "required"))
  }

  // 2) Mods opcionais — respeita a seleção do usuário
  for (const mod of manifest.categories.optional) {
    const enabled =
      local.enabledOptionalMods[mod.id] ??
      mod.defaultEnabled ??
      false

    if (enabled) {
      actions.push(resolveFileAction(mod, installedHashes, "optional"))
    } else if (installedHashes[mod.filename]) {
      actions.push({
        kind: "remove",
        filename: mod.filename,
        reason: "optional-disabled",
      })
    }
  }

  // 3) Configs
  for (const cfg of manifest.configs ?? []) {
    const current = installedHashes[cfg.path]
    if (current === cfg.sha256) {
      actions.push({ kind: "skip", filename: cfg.path, reason: "hash-match" })
    } else {
      actions.push({
        kind: "download",
        filename: cfg.path,
        url: cfg.url,
        sha256: cfg.sha256,
        size: cfg.size,
        category: "config",
      })
    }
  }

  // 4) Limpeza de mods órfãos (que estavam no manifest antigo e sumiram)
  const validFilenames = new Set<string>([
    ...manifest.categories.required.map((m) => m.filename),
    ...manifest.categories.optional.map((m) => m.filename),
    ...(manifest.configs ?? []).map((c) => c.path),
  ])
  const protectedPatterns = manifest.categories.dropin?.protectedPatterns ?? []

  for (const filename of Object.keys(installedHashes)) {
    if (validFilenames.has(filename)) continue
    if (isProtected(filename, protectedPatterns)) continue
    // Se o usuário tinha marcado como drop-in manual, preserva.
    if (local.dropinMods.some((m) => m.filename === filename)) continue

    actions.push({
      kind: "remove",
      filename,
      reason: "orphan",
    })
  }

  const totalBytes = actions
    .filter((a): a is Extract<UpdateAction, { kind: "download" }> => a.kind === "download")
    .reduce((sum, a) => sum + (a.size ?? 0), 0)

  return {
    manifestVersion: manifest.manifestVersion,
    actions,
    totalBytes,
    downloadCount: actions.filter((a) => a.kind === "download").length,
    removeCount: actions.filter((a) => a.kind === "remove").length,
  }
}

function resolveFileAction(
  file: ModEntry,
  installed: Record<string, string>,
  category: "required" | "optional" | "config",
): UpdateAction {
  const current = installed[file.filename]
  if (current === file.sha256) {
    return { kind: "skip", filename: file.filename, reason: "hash-match" }
  }
  return {
    kind: "download",
    filename: file.filename,
    url: file.url,
    sha256: file.sha256,
    size: file.size,
    category,
  }
}

function isProtected(filename: string, patterns: string[]): boolean {
  return patterns.some((p) => globToRegex(p).test(filename))
}

function globToRegex(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp(`^${escaped}$`, "i")
}

/* -------------------------------------------------------------------------- */
/*  Semver leve (major.minor.patch)                                           */
/* -------------------------------------------------------------------------- */

function semverGte(a: string, b: string): boolean {
  const parse = (v: string) =>
    v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0)
  const [a1, a2, a3] = parse(a)
  const [b1, b2, b3] = parse(b)
  if (a1 !== b1) return a1 > b1
  if (a2 !== b2) return a2 > b2
  return a3 >= b3
}
