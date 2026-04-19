/**
 * Aetherion Launcher — Helpers de GitHub Releases / Pages
 *
 * Encapsula o padrão de URLs para evitar colar "owner/repo/releases/..." à mão
 * em vários lugares.
 *
 * Convenção adotada:
 *   - manifest.json → servido via GitHub Pages
 *       https://{OWNER}.github.io/{REPO}/manifest.json
 *   - assets do modpack → GitHub Releases assets
 *       https://github.com/{OWNER}/{REPO}/releases/download/v{VERSION}/{FILENAME}
 *
 * Nada aqui precisa de token: tudo é público.
 */

export interface GithubHostingConfig {
  owner: string
  repo: string
  /** Subdomínio opcional se o Pages estiver configurado para um domínio custom */
  pagesDomain?: string
}

export const AETHERION_HOSTING: GithubHostingConfig = {
  owner: "aetherion-network",
  repo: "aetherion-launcher-assets",
}

/** URL do manifest servido via GitHub Pages */
export function manifestUrl(cfg: GithubHostingConfig = AETHERION_HOSTING): string {
  if (cfg.pagesDomain) return `https://${cfg.pagesDomain}/manifest.json`
  return `https://${cfg.owner}.github.io/${cfg.repo}/manifest.json`
}

/** URL de um asset dentro de um release específico */
export function releaseAssetUrl(
  version: string,
  filename: string,
  cfg: GithubHostingConfig = AETHERION_HOSTING,
): string {
  const tag = version.startsWith("v") ? version : `v${version}`
  return `https://github.com/${cfg.owner}/${cfg.repo}/releases/download/${tag}/${encodeURIComponent(
    filename,
  )}`
}

/** URL da página do release (para mostrar changelog, etc) */
export function releasePageUrl(
  version: string,
  cfg: GithubHostingConfig = AETHERION_HOSTING,
): string {
  const tag = version.startsWith("v") ? version : `v${version}`
  return `https://github.com/${cfg.owner}/${cfg.repo}/releases/tag/${tag}`
}

/** URL do próprio launcher (releases do repositório do app) */
export function launcherDownloadUrl(
  version: string,
  filename: string,
  cfg: GithubHostingConfig,
): string {
  return releaseAssetUrl(version, filename, cfg)
}
