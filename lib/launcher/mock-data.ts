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
    maxRamMb: 8192,
    executablePath: "C:\\Program Files\\Eclipse Adoptium\\jdk-17\\bin\\javaw.exe",
    jvmArgs:
      "-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions",
    autoDownloadRuntime: true,
  },
  launcher: {
    updateChannel: "stable",
    manifestUrl: "",
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

const REQUIRED_MOD_FILENAMES = [
  "AdvancementPlaques-1.19.2-1.4.7.jar",
  "aeroblender-1.19.2-1.0.1.jar",
  "aether-1.19.2-1.4.2-forge.jar",
  "AI-Improvements-1.19.2-0.5.2.jar",
  "alexsdelight-1.4.1.jar",
  "alexsmobs-1.21.1.jar",
  "AlltheCompatibility-1.19.2-(v.2.1.1b).jar",
  "allthemodium-2.1.8-1.19.2-43.1.1.jar",
  "alltheores-2.0.2-1.19.2-43.1.3.jar",
  "Apotheosis-1.19.2-6.5.2.jar",
  "apotheotic_additions1.0.4.jar",
  "ApothicCurios-1.19.2-1.0.3c.jar",
  "appleskin-forge-mc1.19-2.4.2.jar",
  "Aquaculture-1.19.2-2.4.17.jar",
  "aquamirae-6.API15.jar",
  "architectury-6.6.92-forge.jar",
  "ArmorDamageLimit-1.19.2-1.0.0.jar",
  "ars_additions-1.19.2-1.4.0.jar",
  "ars_elemental-1.19.2-0.5.9.4.1.jar",
  "ars_nouveau-1.19.2-3.23.0.jar",
  "atmospheric-1.19.2-5.1.2.jar",
  "AttributeFix-Forge-1.19.2-17.2.8.jar",
  "blueprint-1.19.2-6.2.0.jar",
  "buildinggadgets-3.16.3-build.26+mc1.19.2.jar",
  "citadel-2.1.4-1.19.jar",
  "create-1.19.2-0.5.1.i.jar",
  "Cucumber-1.19.2-6.0.11.jar",
  "curios-forge-1.19.2-5.1.6.4.jar",
  "easy-villagers-forge-1.19.2-1.1.23.jar",
  "FarmersDelight-1.19.2-1.2.4.jar",
  "ftb-library-forge-1902.4.1-build.236.jar",
  "ftb-ultimine-forge-1902.4.2-build.14.jar",
  "geckolib-forge-1.19-3.1.40.jar",
  "Iceberg-1.19.2-forge-1.1.4.jar",
  "L_Enders_Cataclysm-2.46-1.19.2.jar",
  "lionfishapi-1.8.jar",
  "Mekanism-1.19.2-10.3.9.13.jar",
  "MysticalAgriculture-1.19.2-6.0.17.jar",
  "obscure_api-15.jar",
  "Patchouli-1.19.2-77.jar",
  "Placebo-1.19.2-7.4.1.jar",
  "sophisticatedbackpacks-1.19.2-3.20.2.1035.jar",
  "sophisticatedcore-1.19.2-0.6.4.730.jar",
  "sophisticatedstorage-1.19.2-0.9.8.1573.jar",
  "TerraBlender-forge-1.19.2-2.0.1.166.jar",
]

const OPTIONAL_MOD_FILENAMES = [
  "jei-1.19.2-forge-11.8.1.1034.jar",
  "OptiFine_1.19.2_HD_U_I2.jar",
]

function modFile(filename: string, type: "required" | "optional", index: number) {
  const id = filename
    .replace(/\.jar$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const shaSeed = (index + 1).toString(16).padStart(2, "0")

  return {
    path: `mods/${filename}`,
    url: releaseAssetUrl(V, filename),
    sha256: shaSeed.repeat(32),
    size: 0,
    type,
    id,
    name: filename.replace(/\.jar$/i, ""),
    tag: type === "optional" ? "Opcional" : "Obrigatorio",
    defaultEnabled: type === "optional" ? filename.toLowerCase().startsWith("jei-") : undefined,
  }
}

export const MOCK_MANIFEST: Manifest = {
  version: V,
  minecraft: "1.19.2",
  name: "Aetherion Main",
  instanceId: "aetherion-main",
  publishedAt: "2026-04-19T00:00:00Z",
  changelog:
    "- Launcher Electron inicia Minecraft/Forge 1.19.2\n- Forge, libraries, assets e mods sao preparados automaticamente\n- JEI e OptiFine ficam como opcionais selecionaveis\n- Configuracoes de Java, Minecraft, armazenamento, logs, cache e integridade persistentes",

  forge: {
    version: "43.5.0",
    url: releaseAssetUrl(V, "forge-1.19.2-43.5.0-installer.jar"),
    sha256: "a1".repeat(32),
    size: 7_180_192,
    installedProfile: "1.19.2-forge-43.5.0",
  },

  files: [
    ...REQUIRED_MOD_FILENAMES.map((filename, index) =>
      modFile(filename, "required", index),
    ),
    ...OPTIONAL_MOD_FILENAMES.map((filename, index) =>
      modFile(filename, "optional", REQUIRED_MOD_FILENAMES.length + index),
    ),
  ],

  java: {
    recommendedMajor: 17,
    minMajor: 17,
  },

  endpoints: {
    serverHost: "left-fcc.gl.joinmc.link",
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
