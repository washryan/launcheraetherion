const { app, BrowserWindow, ipcMain, shell } = require("electron")
const crypto = require("node:crypto")
const fs = require("node:fs/promises")
const path = require("node:path")

const isDev = !app.isPackaged
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,16}$/

let mainWindow = null

app.setName("Aetherion Launcher")

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#0a0905",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once("ready-to-show", () => mainWindow?.show())

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000/launcher")
    if (process.env.AETHERION_OPEN_DEVTOOLS === "1") {
      mainWindow.webContents.openDevTools({ mode: "detach" })
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/launcher/index.html"))
  }

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

ipcMain.on("window:minimize", () => mainWindow?.minimize())
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on("window:close", () => mainWindow?.close())

ipcMain.handle("accounts:list", () => readAccountsState())
ipcMain.handle("accounts:addOffline", async (_event, username) => {
  const state = await readAccountsState()
  const account = createOfflineAccount(username)
  const existing = state.accounts.find(
    (candidate) =>
      candidate.type === "offline" &&
      candidate.username.toLowerCase() === account.username.toLowerCase(),
  )

  if (existing) throw new Error("Essa conta offline ja foi adicionada.")

  const next = {
    activeId: state.activeId ?? account.id,
    accounts: [...state.accounts, account],
  }
  await writeAccountsState(next)
  return next
})
ipcMain.handle("accounts:remove", async (_event, id) => {
  const state = await readAccountsState()
  const accounts = state.accounts.filter((account) => account.id !== id)
  const activeId = state.activeId === id ? accounts[0]?.id ?? null : state.activeId
  const next = { activeId, accounts }
  await writeAccountsState(next)
  return next
})
ipcMain.handle("accounts:setActive", async (_event, id) => {
  const state = await readAccountsState()
  if (!state.accounts.some((account) => account.id === id)) {
    throw new Error("Conta nao encontrada.")
  }

  const next = { ...state, activeId: id }
  await writeAccountsState(next)
  return next
})
ipcMain.handle("accounts:getDataPath", () => accountsPath())

ipcMain.handle("accounts:addMicrosoft", () => {
  throw new Error("Login Microsoft ainda nao foi implementado neste build.")
})

ipcMain.handle("launch:start", async (_event, args) => {
  console.log("[aetherion] launch requested", args)
  return { ok: true }
})

function validateOfflineUsername(username) {
  const trimmed = String(username ?? "").trim()
  if (!trimmed) return "Informe um nome de usuario."
  if (!USERNAME_REGEX.test(trimmed)) {
    return "Use 3 a 16 caracteres: letras, numeros ou underline."
  }
  return null
}

function createOfflineAccount(username) {
  const clean = String(username ?? "").trim()
  const error = validateOfflineUsername(clean)
  if (error) throw new Error(error)

  const uuid = offlineUuidFor(clean)
  return {
    id: uuid,
    type: "offline",
    username: clean,
    uuid,
    avatarUrl: `https://mc-heads.net/avatar/${encodeURIComponent(clean)}/64`,
    addedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  }
}

function offlineUuidFor(username) {
  const digest = crypto.createHash("md5").update(`OfflinePlayer:${username}`, "utf8").digest()
  const bytes = Buffer.from(digest)
  bytes[6] = (bytes[6] & 0x0f) | 0x30
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString("hex")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

async function readAccountsState() {
  try {
    const raw = await fs.readFile(accountsPath(), "utf8")
    const parsed = JSON.parse(raw)
    return sanitizeAccountsState(parsed)
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.warn("[aetherion] failed to read accounts.json", error)
    }
    return { activeId: null, accounts: [] }
  }
}

async function writeAccountsState(state) {
  const filePath = accountsPath()
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(sanitizeAccountsState(state), null, 2)}\n`, "utf8")
}

function sanitizeAccountsState(value) {
  const accounts = Array.isArray(value?.accounts)
    ? value.accounts.filter((account) => {
        return (
          account &&
          (account.type === "offline" || account.type === "microsoft") &&
          typeof account.id === "string" &&
          typeof account.username === "string" &&
          typeof account.uuid === "string"
        )
      })
    : []

  const activeId =
    typeof value?.activeId === "string" &&
    accounts.some((account) => account.id === value.activeId)
      ? value.activeId
      : accounts[0]?.id ?? null

  return { activeId, accounts }
}

function accountsPath() {
  return path.join(app.getPath("userData"), "accounts.json")
}
