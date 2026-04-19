/**
 * Aetherion Launcher — Electron Preload (Fase 5)
 *
 * Bridge segura entre o renderer (Next.js) e o main process.
 * Só expõe funções — nunca o módulo `ipcRenderer` inteiro.
 *
 * No código do renderer, use: `window.aetherion.launch(...)` etc.
 */

import { contextBridge, ipcRenderer } from "electron"

export const aetherionApi = {
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
  },
  launch: {
    start: (args: {
      accountId: string
      instanceId: string
      fullscreen: boolean
      width: number
      height: number
    }) => ipcRenderer.invoke("launch:start", args),
    onProgress: (cb: (p: { phase: string; percent: number }) => void) => {
      const listener = (_: unknown, p: { phase: string; percent: number }) => cb(p)
      ipcRenderer.on("launch:progress", listener)
      return () => ipcRenderer.off("launch:progress", listener)
    },
  },
  accounts: {
    list: () => ipcRenderer.invoke("accounts:list"),
    addOffline: (username: string) => ipcRenderer.invoke("accounts:addOffline", username),
    addMicrosoft: () => ipcRenderer.invoke("accounts:addMicrosoft"),
    remove: (id: string) => ipcRenderer.invoke("accounts:remove", id),
    setActive: (id: string) => ipcRenderer.invoke("accounts:setActive", id),
  },
  java: {
    detect: () => ipcRenderer.invoke("java:detect"),
    choose: () => ipcRenderer.invoke("java:choose"),
  },
  manifest: {
    fetch: () => ipcRenderer.invoke("manifest:fetch"),
    computePlan: () => ipcRenderer.invoke("manifest:computePlan"),
  },
}

contextBridge.exposeInMainWorld("aetherion", aetherionApi)

declare global {
  interface Window {
    aetherion: typeof aetherionApi
  }
}
