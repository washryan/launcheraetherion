/**
 * Mock data para a Fase 1 (UI).
 * Na Fase 5 (Electron/Tauri), isso será substituído por:
 *  - leitura de arquivos locais (accounts.json, instance-state.json, settings.json)
 *  - fetch do manifest remoto
 *  - IPC para listagem real de mods em disco
 */
import type {
  Account,
  DropinMod,
  LauncherSettings,
  Manifest,
  ModEntry,
  MojangStatus,
  ServerStatus,
} from "./types"

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

export const REQUIRED_MODS: ModEntry[] = [
  {
    id: "aetherion-core",
    name: "Aetherion Core",
    version: "2.4.1",
    url: "https://cdn.aetherion.gg/mods/aetherion-core-2.4.1.jar",
    filename: "aetherion-core-2.4.1.jar",
    sha256: "a".repeat(64),
    size: 4_200_000,
    tag: "Core",
    author: "Aetherion Team",
    locked: true,
  },
  {
    id: "create",
    name: "Create",
    version: "0.5.1f",
    url: "https://cdn.aetherion.gg/mods/create-0.5.1f.jar",
    filename: "create-0.5.1f.jar",
    sha256: "b".repeat(64),
    size: 15_800_000,
    tag: "Tech",
    author: "simibubi",
    locked: true,
  },
  {
    id: "jei",
    name: "Just Enough Items",
    version: "11.6.0",
    url: "https://cdn.aetherion.gg/mods/jei-11.6.0.jar",
    filename: "jei-11.6.0.jar",
    sha256: "c".repeat(64),
    size: 2_100_000,
    tag: "Utility",
    author: "mezz",
    locked: true,
  },
  {
    id: "iron-chests",
    name: "Iron Chests",
    version: "14.2.9",
    url: "https://cdn.aetherion.gg/mods/ironchests-14.2.9.jar",
    filename: "ironchests-14.2.9.jar",
    sha256: "d".repeat(64),
    size: 850_000,
    tag: "Storage",
    author: "ProgWML6",
    locked: true,
  },
]

export const OPTIONAL_MODS: ModEntry[] = [
  {
    id: "journeymap",
    name: "JourneyMap",
    version: "5.9.7",
    url: "https://cdn.aetherion.gg/mods/journeymap-5.9.7.jar",
    filename: "journeymap-5.9.7.jar",
    sha256: "e".repeat(64),
    size: 3_400_000,
    tag: "Map",
    author: "techbrew",
    defaultEnabled: true,
  },
  {
    id: "sound-physics",
    name: "Sound Physics Remastered",
    version: "1.1.6",
    url: "https://cdn.aetherion.gg/mods/soundphysics-1.1.6.jar",
    filename: "soundphysics-1.1.6.jar",
    sha256: "f".repeat(64),
    size: 520_000,
    tag: "Audio",
    author: "vlad2305m",
    defaultEnabled: false,
  },
  {
    id: "dynamic-lights",
    name: "Dynamic Lights",
    version: "1.7.4",
    url: "https://cdn.aetherion.gg/mods/dynamiclights-1.7.4.jar",
    filename: "dynamiclights-1.7.4.jar",
    sha256: "0".repeat(64),
    size: 210_000,
    tag: "Graphics",
    author: "atomicstryker",
    defaultEnabled: true,
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
    resolution: { width: 1920, height: 1080 },
    fullscreen: false,
    autoConnectServer: true,
    detachProcess: true,
    closeOnLaunch: false,
  },
  java: {
    minRamMb: 4096,
    maxRamMb: 10240,
    executablePath: "C:\\Program Files\\Java\\jdk-17\\bin\\javaw.exe",
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

export const MOCK_MANIFEST_PREVIEW: Pick<
  Manifest,
  "manifestVersion" | "name" | "minecraft" | "java" | "publishedAt"
> = {
  manifestVersion: "1.4.2",
  name: "Aetherion Main",
  minecraft: { version: "1.19.2", loader: { type: "forge", version: "43.3.13" } },
  java: { recommendedMajor: 17, minMajor: 17 },
  publishedAt: "2026-04-14T12:00:00Z",
}
