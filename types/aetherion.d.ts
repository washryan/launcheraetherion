import type { AccountsState } from "@/lib/launcher/types"

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
        }) => Promise<{ ok: boolean }>
      }
      accounts: {
        list: () => Promise<AccountsState>
        addOffline: (username: string) => Promise<AccountsState>
        addMicrosoft: () => Promise<AccountsState>
        remove: (id: string) => Promise<AccountsState>
        setActive: (id: string) => Promise<AccountsState>
        getDataPath: () => Promise<string>
      }
    }
  }
}
