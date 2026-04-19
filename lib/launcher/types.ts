/**
 * Aetherion Launcher — Type System
 *
 * Estes tipos modelam o domínio COMPLETO do launcher. Eles são usados
 * tanto pela UI (fase atual) quanto pela camada nativa (Electron/Tauri — Fase 5).
 *
 * Importante: mantenha esse arquivo como fonte única da verdade. Quando migrar
 * para Electron/Tauri, os mesmos tipos poderão ser compartilhados com o
 * processo principal via IPC.
 */

// ==========================================================================
// CONTAS
// ==========================================================================

export type AccountType = "offline" | "microsoft"

export interface BaseAccount {
  id: string
  type: AccountType
  username: string
  uuid: string
  /** URL/path da skin — para offline usamos um avatar procedural */
  avatarUrl?: string
  /** ISO timestamp de último uso */
  lastUsedAt?: string
}

export interface OfflineAccount extends BaseAccount {
  type: "offline"
}

export interface MicrosoftAccount extends BaseAccount {
  type: "microsoft"
  /**
   * ATENÇÃO: tokens NUNCA devem ser persistidos em texto puro.
   * Na fase 5 (Electron), usaremos `safeStorage` (criptografia nativa do OS)
   * ou `keytar` (keychain do sistema). Aqui marcamos como opcional apenas
   * para fins de tipagem — não é armazenado na UI.
   */
  accessTokenRef?: string
  refreshTokenRef?: string
  expiresAt?: string
}

export type Account = OfflineAccount | MicrosoftAccount

// ==========================================================================
// MANIFEST REMOTO DO MODPACK
// ==========================================================================

/**
 * O manifest é a fonte de verdade remota do servidor. O launcher baixa esse
 * JSON de um endpoint conhecido (ex: https://cdn.aetherion.gg/manifest.json),
 * compara com o estado local e decide o que baixar/atualizar.
 */
export interface Manifest {
  /** Versão semântica do manifest em si (ex: "1.4.2") */
  manifestVersion: string
  /** ID da instância/modpack (ex: "aetherion-main") */
  instanceId: string
  /** Nome legível exibido na UI */
  name: string
  /** Descrição / changelog curto */
  description?: string
  /** Quando este manifest foi publicado (ISO) */
  publishedAt: string

  minecraft: {
    version: string // ex: "1.19.2"
    loader: ModLoader
  }

  java: {
    /** Versão recomendada (ex: 17) */
    recommendedMajor: number
    /** Versão mínima aceitável */
    minMajor: number
    /** URLs de runtime por plataforma — opcional (fallback para Adoptium) */
    runtimes?: Partial<Record<PlatformKey, RuntimeAsset>>
  }

  /** Versão mínima do launcher exigida para rodar este manifest */
  requiredLauncherVersion?: string

  categories: {
    required: ModEntry[] // travados — sempre ligados
    optional: ModEntry[] // podem ser ativados/desativados pelo usuário
    dropin: DropinRules // regras para mods locais do usuário
  }

  configs?: FileEntry[] // arquivos de config (em config/)
  resourcePacks?: FileEntry[]
  shaderpacks?: FileEntry[]

  /** Endpoints opcionais para telemetria, status do servidor etc */
  endpoints?: {
    serverStatus?: string
    news?: string
    site?: string
    discord?: string
    youtube?: string
  }
}

export interface ModLoader {
  type: "forge" | "fabric" | "neoforge" | "quilt"
  version: string
}

/**
 * Chaves de plataforma usadas no manifest.java.runtimes.
 * Cobre os SOs que o Minecraft + Forge suportam oficialmente.
 */
export type PlatformKey =
  | "windows-x64"
  | "linux-x64"
  | "macos-arm64"
  | "macos-x64"

export interface RuntimeAsset {
  url: string
  sha256: string
  size: number
}

/** Entrada de mod no manifest */
export interface ModEntry {
  id: string // identificador estável
  name: string // nome legível
  version: string
  /** URL direta do arquivo .jar. Pode ser CDN, GitHub Release etc */
  url: string
  /** Nome do arquivo no disco (deve ser estável) */
  filename: string
  /** SHA-256 para validação de integridade */
  sha256: string
  size: number
  /** Descrição/autor opcional */
  description?: string
  author?: string
  /** Categoria de display (ex: "Performance", "UI", "Utility") */
  tag?: string
  /** Se true, não pode ser desativado pelo usuário */
  locked?: boolean
  /** Default enabled state (para mods opcionais) */
  defaultEnabled?: boolean
}

/** Regras para mods drop-in do usuário */
export interface DropinRules {
  /** Se o launcher preserva mods não listados no manifest (default: true) */
  preserve: boolean
  /** Padrões de nomes que o launcher NUNCA deve deletar */
  protectedPatterns?: string[]
}

export interface FileEntry {
  path: string // caminho relativo à raiz da instância (ex: "config/mod.toml")
  url: string
  sha256: string
  size: number
}

// ==========================================================================
// ESTADO LOCAL (o que fica na máquina do usuário)
// ==========================================================================

export interface LocalInstanceState {
  instanceId: string
  /** Versão do manifest que está instalada atualmente */
  installedManifestVersion: string
  /**
   * Estado dos mods opcionais. Chave = mod.id.
   * Ausência = usar o `defaultEnabled` do manifest.
   * Presença explícita sobrescreve o default (inclui desativar um default-enabled).
   */
  enabledOptionalMods: Record<string, boolean>
  /** Drop-in mods detectados na pasta mods/ (fora do manifest) */
  dropinMods: DropinMod[]
  /** Último check de atualização (ISO) */
  lastCheckedAt?: string
}

export interface DropinMod {
  filename: string
  size: number
  enabled: boolean // usuário pode desabilitar renomeando para .disabled
  addedAt: string
}

// ==========================================================================
// CONFIGURAÇÕES DO USUÁRIO (preferências do launcher)
// ==========================================================================

export interface LauncherSettings {
  minecraft: MinecraftSettings
  java: JavaSettings
  launcher: LauncherPreferences
}

export interface MinecraftSettings {
  resolution: { width: number; height: number }
  fullscreen: boolean
  autoConnectServer: boolean
  detachProcess: boolean // inicia jogo separado do launcher
  closeOnLaunch: boolean // fecha launcher quando jogo abrir
  gameDirectory?: string // pasta customizada da instância
}

export interface JavaSettings {
  minRamMb: number // ex: 4096
  maxRamMb: number // ex: 10240
  /** Caminho absoluto do executável (javaw.exe / java) */
  executablePath?: string
  /** Argumentos JVM extras (split por espaço ao lançar) */
  jvmArgs: string
  /** Se true, launcher baixa runtime automaticamente quando necessário */
  autoDownloadRuntime: boolean
}

export interface LauncherPreferences {
  updateChannel: "stable" | "beta"
  dataDirectory?: string // onde ficam instâncias, mods, cache
  /** Fecha o launcher na bandeja em vez de sair */
  minimizeToTray: boolean
  /** Envia anônimo crash reports */
  telemetry: boolean
}

// ==========================================================================
// STATUS DO SERVIDOR / DASHBOARD
// ==========================================================================

export interface ServerStatus {
  online: boolean
  players: { current: number; max: number }
  motd?: string
  ping?: number
}

export interface MojangStatus {
  auth: "green" | "yellow" | "red"
  session: "green" | "yellow" | "red"
}

// ==========================================================================
// ESTADO DE CONTAS (persistido em accounts.json)
// ==========================================================================

export interface AccountsState {
  activeId: string | null
  accounts: Account[]
}

/**
 * Tokens Microsoft — SEMPRE guardados via keytar no Fase 5.
 * Este tipo é só para tráfego em memória entre o OAuth e o storage.
 */
export interface MicrosoftTokens {
  accessToken: string
  refreshToken: string
  /** ISO timestamp em que o accessToken expira */
  expiresAt: string
}

// ==========================================================================
// UPDATER — PLANO DE ATUALIZAÇÃO
// ==========================================================================

export type UpdateAction =
  | {
      kind: "download"
      filename: string
      url: string
      sha256: string
      size: number
      category: "required" | "optional" | "config"
    }
  | {
      kind: "skip"
      filename: string
      reason: "hash-match"
    }
  | {
      kind: "remove"
      filename: string
      reason: "optional-disabled" | "orphan"
    }

export interface UpdatePlan {
  manifestVersion: string
  actions: UpdateAction[]
  totalBytes: number
  downloadCount: number
  removeCount: number
}

// ==========================================================================
// JAVA RUNTIME
// ==========================================================================

export interface JavaInstallation {
  path: string // caminho absoluto do javaw/java executável
  major: number // 8, 17, 21...
  version: string // "17.0.9"
  vendor: string // "Temurin", "Oracle", "Zulu", etc.
  arch: "x64" | "x86" | "arm64"
  source: "path" | "java-home" | "registry" | "bundled" | "user"
}

export type JavaPlan =
  | { action: "use-local"; installation: JavaInstallation }
  | {
      action: "download"
      url: string
      sha256: string
      size: number
      target: string
    }
  | { action: "error"; message: string }
