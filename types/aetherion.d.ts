import type { AccountsState, LauncherSettings, LaunchProgress } from "@/lib/launcher/types"

export {}

declare global {
  interface Window {
    aetherion?: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
      launch: {
        start: (args: {
          accountId: string
          instanceId: string
          fullscreen: boolean
          width: number
          height: number
          autoConnectServer?: boolean
          detachProcess?: boolean
          closeOnLaunch?: boolean
        }) => Promise<{
          ok: boolean
          target?: {
            minecraft: string
            forge: string
          }
        }>
        cancel: () => Promise<{ ok: boolean }>
        onProgress: (cb: (progress: LaunchProgress) => void) => () => void
      }
      accounts: {
        list: () => Promise<AccountsState>
        addOffline: (username: string) => Promise<AccountsState>
        addMicrosoft: () => Promise<AccountsState>
        remove: (id: string) => Promise<AccountsState>
        setActive: (id: string) => Promise<AccountsState>
        getDataPath: () => Promise<string>
      }
      settings: {
        get: () => Promise<LauncherSettings>
        update: (patch: Partial<LauncherSettings>) => Promise<LauncherSettings>
        getPaths: () => Promise<{
          settingsPath: string
          instancePath: string
        }>
        openInstanceFolder: () => Promise<{ ok: boolean }>
      }
    }
  }
}
