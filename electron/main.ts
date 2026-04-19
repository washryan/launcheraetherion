/**
 * Aetherion Launcher — Electron Main Process (Fase 5 — boilerplate)
 *
 * Este arquivo NÃO roda no preview do v0. É o processo principal do Electron
 * que você vai instanciar quando rodar local no seu PC.
 *
 * Setup mínimo (quando você for executar de verdade):
 *
 *   pnpm add -D electron electron-builder concurrently wait-on tsx
 *   pnpm add electron-store keytar p-limit axios
 *
 * package.json (adicionar):
 *   "main": "dist-electron/main.js",
 *   "scripts": {
 *     "electron:dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3000 && tsx electron/main.ts\"",
 *     "electron:build": "next build && next export && tsc -p electron/tsconfig.json && electron-builder"
 *   }
 */

import { app, BrowserWindow, ipcMain, shell } from "electron"
import path from "node:path"
import { spawn } from "node:child_process"

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 740,
    minWidth: 1000,
    minHeight: 650,
    frame: false, // usamos title bar custom (WindowFrame component)
    titleBarStyle: "hidden",
    backgroundColor: "#0a0905",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once("ready-to-show", () => mainWindow?.show())

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools({ mode: "detach" })
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  // Links externos abrem no navegador do sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

/* -------------------------------------------------------------------------- */
/*  IPC — bridge entre o renderer e o mundo real                              */
/* -------------------------------------------------------------------------- */

// Window controls (chamados pelo WindowFrame.tsx)
ipcMain.on("window:minimize", () => mainWindow?.minimize())
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on("window:close", () => mainWindow?.close())

// Launch Minecraft — stub. Implementação real na Fase 5 completa.
ipcMain.handle("launch:start", async (_evt, args: LaunchArgs) => {
  console.log("[aetherion] launch requested", args)
  // TODO:
  //  1) Resolver conta ativa (accounts.ts)
  //  2) Rodar updater (manifest.ts)
  //  3) Resolver Java (java.ts)
  //  4) Montar classpath (Forge + libs + mc jar)
  //  5) spawn(javawPath, [...jvmArgs, mainClass, ...mcArgs], { detached: true })
  return { ok: true }
})

interface LaunchArgs {
  accountId: string
  instanceId: string
  fullscreen: boolean
  width: number
  height: number
}
