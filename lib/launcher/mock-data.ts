/**
 * Mock data para o preview (Fase 1).
 * No Electron: substituído por leitura real de accounts.json / instance-state.json
 * e fetch do manifest remoto via GitHub Pages.
 */
import type {
  Account,
  DropinMod,
  LauncherSettings,
  Manifest,
  MojangStatus,
  ServerStatus,
} from "./types"
import { releaseAssetUrl } from "./github-releases"

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc_1",
    type: "microsoft",
    username: "Aetherion_Main",
    uuid: "1a04d0e5-45db-36ef-974f-c53c337e46cb",
    avatarUrl: "/minecraft-avatar-dark-knight.jpg",
    lastUsedAt: "2026-04-17T22:10:00Z",
  },
  {
    id: "acc_2",
    type: "offline",
    username: "Guardian",
    uuid: "1c25df42-1e71-3d46-b785-40e44b7367f4",
    avatarUrl: "/minecraft-avatar-wizard.jpg",
    lastUsedAt: "2026-04-15T18:32:00Z",
  },
  {
    id: "acc_3",
    type: "offline",
    username: "RuneKeeper",
    uuid: "8b8c2d09-4d8d-4b79-b612-6f1b2e3c4d5e",
    avatarUrl: "/minecraft-avatar-ranger.jpg",
  },
]

export const MOCK_DROPIN_MODS: DropinMod[] = [
  {
    filename: "xaeros-minimap-24.3.0.jar",
    size: 980_000,
    enabled: true,
    addedAt: "2026-04-12T14:20:00Z",
  },
  {
    filename: "optifine-1.19.2_HD_U_I5.jar",
    size: 8_100_000,
    enabled: false,
    addedAt: "2026-04-10T09:05:00Z",
  },
]

export const DEFAULT_SETTINGS: LauncherSettings = {
  minecraft: {
    resolution: { width: 1280, height: 720 },
    fullscreen: false,
    autoConnectServer: true,
    detachProcess: true,
    closeOnLaunch: false,
  },
  java: {
    minRamMb: 4096,
    maxRamMb: 10240,
    executablePath: "C:\\Program Files\\Eclipse Adoptium\\jdk-17\\bin\\javaw.exe",
    jvmArgs:
      "-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions",
    autoDownloadRuntime: true,
  },
  launcher: {
    updateChannel: "stable",
    minimizeToTray: true,
    telemetry: false,
  },
}

export const MOCK_SERVER_STATUS: ServerStatus = {
  online: true,
  players: { current: 147, max: 1000 },
  motd: "Aetherion • Reino Etéreo",
  ping: 32,
}

export const MOCK_MOJANG_STATUS: MojangStatus = {
  auth: "green",
  session: "green",
}

/* -------------------------------------------------------------------------- */
/*  Manifest de exemplo no novo formato (GitHub Releases)                      */
/* -------------------------------------------------------------------------- */

const V = "0.3"

export const MOCK_MANIFEST: Manifest = {
  version: V,
  minecraft: "1.19.2",
  name: "Aetherion Main",
  instanceId: "aetherion-main",
  publishedAt: "2026-04-14T12:00:00Z",
  changelog: "- Novo sistema de classes\n- Balanceamento de mobs\n- Bugfix em dungeons",

  forge: {
    version: "43.3.13",
    url: releaseAssetUrl(V, "forge-1.19.2-43.3.13-installer.jar"),
    sha256: "a1".repeat(32),
    size: 5_400_000,
    installedProfile: "1.19.2-forge-43.3.13",
  },

  files: [
    // --- Required ---
    {
      path: "mods/aetherion-core-2.4.1.jar",
      url: releaseAssetUrl(V, "aetherion-core-2.4.1.jar"),
      sha256: "b1".repeat(32),
      size: 4_200_000,
      type: "required",
      id: "aetherion-core",
      name: "Aetherion Core",
      version: "2.4.1",
      tag: "Core",
      author: "Aetherion Team",
    },
    {
      path: "mods/create-0.5.1f.jar",
      url: releaseAssetUrl(V, "create-0.5.1f.jar"),
      sha256: "b2".repeat(32),
      size: 15_800_000,
      type: "required",
      id: "create",
      name: "Create",
      version: "0.5.1f",
      tag: "Tech",
      author: "simibubi",
    },
    {
      path: "mods/jei-11.6.0.jar",
      url: releaseAssetUrl(V, "jei-11.6.0.jar"),
      sha256: "b3".repeat(32),
      size: 2_100_000,
      type: "required",
      id: "jei",
      name: "Just Enough Items",
      version: "11.6.0",
      tag: "Utility",
      author: "mezz",
    },
    {
      path: "mods/ironchests-14.2.9.jar",
      url: releaseAssetUrl(V, "ironchests-14.2.9.jar"),
      sha256: "b4".repeat(32),
      size: 850_000,
      type: "required",
      id: "iron-chests",
      name: "Iron Chests",
      version: "14.2.9",
      tag: "Storage",
      author: "ProgWML6",
    },

    // --- Optional ---
    {
      path: "mods/journeymap-5.9.7.jar",
      url: releaseAssetUrl(V, "journeymap-5.9.7.jar"),
      sha256: "c1".repeat(32),
      size: 3_400_000,
      type: "optional",
      id: "journeymap",
      name: "JourneyMap",
      version: "5.9.7",
      tag: "Map",
      author: "techbrew",
      defaultEnabled: true,
    },
    {
      path: "mods/soundphysics-1.1.6.jar",
      url: releaseAssetUrl(V, "soundphysics-1.1.6.jar"),
      sha256: "c2".repeat(32),
      size: 520_000,
      type: "optional",
      id: "sound-physics",
      name: "Sound Physics Remastered",
      version: "1.1.6",
      tag: "Audio",
      author: "vlad2305m",
      defaultEnabled: false,
    },
    {
      path: "mods/dynamiclights-1.7.4.jar",
      url: releaseAssetUrl(V, "dynamiclights-1.7.4.jar"),
      sha256: "c3".repeat(32),
      size: 210_000,
      type: "optional",
      id: "dynamic-lights",
      name: "Dynamic Lights",
      version: "1.7.4",
      tag: "Graphics",
      author: "atomicstryker",
      defaultEnabled: true,
    },

    // --- Configs ---
    {
      path: "config/aetherion-common.toml",
      url: releaseAssetUrl(V, "aetherion-common.toml"),
      sha256: "d1".repeat(32),
      size: 3_200,
      type: "config",
    },
    {
      path: "config/create-client.toml",
      url: releaseAssetUrl(V, "create-client.toml"),
      sha256: "d2".repeat(32),
      size: 1_800,
      type: "config",
    },
  ],

  java: {
    recommendedMajor: 17,
    minMajor: 17,
  },

  endpoints: {
    serverHost: "play.aetherion.gg",
    serverPort: 25565,
    site: "https://aetherion-network.github.io/aetherion-launcher-assets/",
    discord: "https://discord.gg/aetherion",
    youtube: "https://youtube.com/@aetherion",
  },

  protectedPatterns: ["mods/*-SERVER.jar", "config/custom-*.toml"],
}

/** Listas derivadas — facilitam o mock na UI sem perder a fonte única. */
export const REQUIRED_MODS = MOCK_MANIFEST.files.filter((f) => f.type === "required")
export const OPTIONAL_MODS = MOCK_MANIFEST.files.filter((f) => f.type === "optional")

export const MOCK_MANIFEST_PREVIEW = {
  version: MOCK_MANIFEST.version,
  name: MOCK_MANIFEST.name,
  minecraft: MOCK_MANIFEST.minecraft,
  forgeVersion: MOCK_MANIFEST.forge.version,
  publishedAt: MOCK_MANIFEST.publishedAt,
} as const
