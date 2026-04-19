const { app, BrowserWindow, ipcMain, shell } = require("electron")
const crypto = require("node:crypto")
const fsSync = require("node:fs")
const fs = require("node:fs/promises")
const { once } = require("node:events")
const path = require("node:path")

const isDev = !app.isPackaged
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,16}$/
const LAUNCH_TARGET = {
  minecraft: "1.19.2",
  forge: "43.5.0",
}
const FORGE_INSTALLER_FILENAME = `forge-${LAUNCH_TARGET.minecraft}-${LAUNCH_TARGET.forge}-installer.jar`
const DEFAULT_MANIFEST = {
  version: "0.1.0-dev",
  minecraft: LAUNCH_TARGET.minecraft,
  name: "Aetherion Main",
  instanceId: "aetherion-main",
  publishedAt: "2026-04-19T00:00:00.000Z",
  requiredLauncherVersion: "0.1.0",
  forge: {
    version: LAUNCH_TARGET.forge,
    url: `https://maven.minecraftforge.net/net/minecraftforge/forge/${LAUNCH_TARGET.minecraft}-${LAUNCH_TARGET.forge}/${FORGE_INSTALLER_FILENAME}`,
    sha256: "4869e60456321e99eb5120ae39171c382c27a05858cdfd4b90ff123e3750e681",
    size: 7180192,
    installedProfile: `${LAUNCH_TARGET.minecraft}-forge-${LAUNCH_TARGET.forge}`,
  },
  files: [],
  java: { recommendedMajor: 17, minMajor: 17 },
  protectedPatterns: ["mods/*-SERVER.jar", "config/custom-*.toml"],
}

let mainWindow = null
let activeLaunchAbort = null

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
  activeLaunchAbort?.abort()
  const controller = new AbortController()
  activeLaunchAbort = controller

  try {
    const target = await runUpdater(args, controller.signal)
    return { ok: true, target }
  } catch (error) {
    if (controller.signal.aborted) {
      emitLaunchProgress({
        phase: "error",
        message: "Atualizacao cancelada.",
        error: "Cancelado pelo usuario.",
      })
      return { ok: false, cancelled: true }
    }

    const message = error instanceof Error ? error.message : String(error)
    emitLaunchProgress({
      phase: "error",
      message: "Falha na atualizacao.",
      error: message,
    })
    throw error
  } finally {
    if (activeLaunchAbort === controller) activeLaunchAbort = null
  }
})

ipcMain.handle("launch:cancel", () => {
  activeLaunchAbort?.abort()
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

async function runUpdater(args, signal) {
  emitLaunchProgress({
    phase: "fetching-manifest",
    message: `Buscando manifest (${LAUNCH_TARGET.minecraft} + Forge ${LAUNCH_TARGET.forge})...`,
  })

  const manifest = await loadManifest(signal)
  validateManifest(manifest)

  const instanceId = manifest.instanceId || args?.instanceId || "aetherion-main"
  const root = instancePath(instanceId)
  await fs.mkdir(root, { recursive: true })

  emitLaunchProgress({
    phase: "computing-plan",
    message: `Escaneando instancia local em ${root}`,
  })

  const [localState, installedHashes] = await Promise.all([
    readInstanceState(root, manifest, instanceId),
    scanInstalledHashes(root),
  ])
  throwIfAborted(signal)

  const plan = computeUpdatePlan(manifest, localState, installedHashes)

  if (plan.downloadCount === 0 && plan.removeCount === 0) {
    emitLaunchProgress({
      phase: "verifying",
      message: `Tudo atualizado: ${manifest.minecraft} + Forge ${manifest.forge.version}`,
      totalBytes: 0,
      loadedBytes: 0,
      filesDone: 0,
      filesTotal: 0,
    })
  } else {
    await executeUpdatePlan(root, plan, signal)
  }

  const nextState = {
    instanceId,
    installedManifestVersion: manifest.version,
    enabledOptionalMods: localState.enabledOptionalMods || {},
    dropinMods: localState.dropinMods || [],
    lastCheckedAt: new Date().toISOString(),
    installedForgeSha: manifest.forge.sha256,
  }
  await writeInstanceState(root, nextState)

  emitLaunchProgress({
    phase: "running",
    message: "Atualizacao concluida. Launch do Minecraft entra na proxima fase.",
    totalBytes: plan.totalBytes,
    loadedBytes: plan.totalBytes,
    filesDone: plan.downloadCount,
    filesTotal: plan.downloadCount,
  })

  return { minecraft: manifest.minecraft, forge: manifest.forge.version }
}

async function loadManifest(signal) {
  const url = process.env.AETHERION_MANIFEST_URL
  if (!url) return DEFAULT_MANIFEST

  const cacheBust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
  const response = await fetch(cacheBust, {
    signal,
    headers: { Accept: "application/json" },
    redirect: "follow",
  })
  if (!response.ok) {
    throw new Error(`Falha ao buscar manifest (${response.status} ${response.statusText})`)
  }
  return response.json()
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== "object") throw new Error("Manifest invalido.")
  if (!manifest.version) throw new Error("Manifest invalido: campo 'version' ausente.")
  if (!manifest.minecraft) throw new Error("Manifest invalido: campo 'minecraft' ausente.")
  if (!manifest.forge?.url || !manifest.forge?.sha256 || !manifest.forge?.version) {
    throw new Error("Manifest invalido: bloco 'forge' incompleto.")
  }
  if (!Array.isArray(manifest.files)) {
    throw new Error("Manifest invalido: 'files' deve ser um array.")
  }
  for (const file of manifest.files) {
    if (!file.path || !file.url || !file.sha256 || typeof file.size !== "number") {
      throw new Error(`Manifest invalido: arquivo '${file.path || "(sem path)"}' incompleto.`)
    }
  }
}

async function readInstanceState(root, manifest, instanceId) {
  try {
    const raw = await fs.readFile(instanceStatePath(root), "utf8")
    const parsed = JSON.parse(raw)
    return {
      instanceId,
      installedManifestVersion: parsed.installedManifestVersion ?? null,
      enabledOptionalMods: parsed.enabledOptionalMods || {},
      dropinMods: Array.isArray(parsed.dropinMods) ? parsed.dropinMods : [],
      lastCheckedAt: parsed.lastCheckedAt,
      installedForgeSha: parsed.installedForgeSha,
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.warn("[aetherion] failed to read instance-state.json", error)
    }
    return {
      instanceId,
      installedManifestVersion: null,
      enabledOptionalMods: {},
      dropinMods: [],
      installedForgeSha: null,
    }
  }
}

async function writeInstanceState(root, state) {
  await fs.mkdir(root, { recursive: true })
  await fs.writeFile(instanceStatePath(root), `${JSON.stringify(state, null, 2)}\n`, "utf8")
}

function computeUpdatePlan(manifest, local, installedHashes) {
  const actions = []
  const needsForgeInstall =
    local.installedForgeSha?.toLowerCase() !== manifest.forge.sha256.toLowerCase()

  if (needsForgeInstall) {
    const forgePath = `forge/forge-${manifest.minecraft}-${manifest.forge.version}-installer.jar`
    if (installedHashes[forgePath]?.toLowerCase() === manifest.forge.sha256.toLowerCase()) {
      actions.push({ kind: "skip", path: forgePath, reason: "hash-match" })
    } else {
      actions.push({
        kind: "download",
        path: forgePath,
        url: manifest.forge.url,
        sha256: manifest.forge.sha256,
        size: manifest.forge.size || 0,
        category: "forge",
      })
    }
  }

  const validPaths = new Set()
  for (const file of manifest.files) {
    validPaths.add(file.path)

    if (file.type === "optional") {
      const enabled =
        local.enabledOptionalMods?.[file.path] !== undefined
          ? local.enabledOptionalMods[file.path]
          : file.defaultEnabled ?? false
      if (!enabled) {
        if (installedHashes[file.path]) {
          actions.push({ kind: "remove", path: file.path, reason: "optional-disabled" })
        }
        continue
      }
    }

    if (installedHashes[file.path]?.toLowerCase() === file.sha256.toLowerCase()) {
      actions.push({ kind: "skip", path: file.path, reason: "hash-match" })
    } else {
      actions.push({
        kind: "download",
        path: file.path,
        url: file.url,
        sha256: file.sha256,
        size: file.size,
        category: file.type,
      })
    }
  }

  const protectedPatterns = manifest.protectedPatterns || []
  const dropinSet = new Set((local.dropinMods || []).map((mod) => `mods/${mod.filename}`))
  for (const filePath of Object.keys(installedHashes)) {
    if (validPaths.has(filePath)) continue
    if (filePath.startsWith("forge/")) continue
    if (dropinSet.has(filePath)) continue
    if (isProtected(filePath, protectedPatterns)) continue
    actions.push({ kind: "remove", path: filePath, reason: "orphan" })
  }

  const downloads = actions.filter((action) => action.kind === "download")
  return {
    manifestVersion: manifest.version,
    fromVersion: local.installedManifestVersion,
    actions,
    totalBytes: downloads.reduce((total, action) => total + (action.size || 0), 0),
    downloadCount: downloads.length,
    removeCount: actions.filter((action) => action.kind === "remove").length,
    needsForgeInstall,
  }
}

async function executeUpdatePlan(root, plan, signal) {
  const downloads = plan.actions.filter((action) => action.kind === "download")
  const removals = plan.actions.filter((action) => action.kind === "remove")
  let loadedBytes = 0
  let filesDone = 0

  emitLaunchProgress({
    phase: "downloading-files",
    message: downloads.length ? "Baixando arquivos..." : "Nenhum download necessario.",
    totalBytes: plan.totalBytes,
    loadedBytes,
    filesDone,
    filesTotal: downloads.length,
  })

  await runWithConcurrency(downloads, 4, async (action) => {
    await downloadAction(root, action, signal, (delta) => {
      loadedBytes += delta
      emitLaunchProgress({
        phase: "downloading-files",
        message: `Baixando ${displayName(action.path)}...`,
        totalBytes: plan.totalBytes,
        loadedBytes,
        filesDone,
        filesTotal: downloads.length,
      })
    })
    filesDone++
    emitLaunchProgress({
      phase: "downloading-files",
      message: `${displayName(action.path)} concluido.`,
      totalBytes: plan.totalBytes,
      loadedBytes,
      filesDone,
      filesTotal: downloads.length,
    })
  })

  if (removals.length) {
    emitLaunchProgress({
      phase: "verifying",
      message: "Removendo arquivos antigos...",
      totalBytes: plan.totalBytes,
      loadedBytes,
      filesDone,
      filesTotal: downloads.length,
    })
    for (const action of removals) {
      await fs.rm(safeResolve(root, action.path), { force: true })
    }
  }

  emitLaunchProgress({
    phase: "verifying",
    message: "Verificacao concluida.",
    totalBytes: plan.totalBytes,
    loadedBytes: plan.totalBytes,
    filesDone: downloads.length,
    filesTotal: downloads.length,
  })
}

async function downloadAction(root, action, signal, onBytes) {
  const target = safeResolve(root, action.path)
  const temp = `${target}.download`
  await fs.mkdir(path.dirname(target), { recursive: true })

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await downloadToTemp(action.url, temp, action.sha256, signal, onBytes)
      await fs.rename(temp, target)
      return
    } catch (error) {
      await fs.rm(temp, { force: true }).catch(() => undefined)
      if (signal.aborted || attempt === 3) throw error
      await sleep([1000, 3000, 9000][attempt - 1])
    }
  }
}

async function downloadToTemp(url, temp, expectedSha256, signal, onBytes) {
  throwIfAborted(signal)
  const response = await fetch(url, { signal, redirect: "follow" })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} em ${url}`)
  }
  if (!response.body) throw new Error(`Resposta sem stream em ${url}`)

  const hash = crypto.createHash("sha256")
  const writer = fsSync.createWriteStream(temp)
  const reader = response.body.getReader()

  try {
    while (true) {
      throwIfAborted(signal)
      const { done, value } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value)
      hash.update(chunk)
      onBytes(chunk.byteLength)
      if (!writer.write(chunk)) await once(writer, "drain")
    }
  } finally {
    writer.end()
  }

  await once(writer, "finish")
  const actual = hash.digest("hex")
  if (expectedSha256 && actual.toLowerCase() !== expectedSha256.toLowerCase()) {
    throw new Error(
      `Hash SHA-256 nao confere para ${url}\n  esperado: ${expectedSha256}\n  recebido: ${actual}`,
    )
  }
}

async function scanInstalledHashes(root) {
  const hashes = {}
  for (const folder of ["forge", "mods", "config", "resourcepacks", "shaderpacks"]) {
    const absolute = path.join(root, folder)
    if (!fsSync.existsSync(absolute)) continue
    const files = await walkFiles(absolute)
    for (const file of files) {
      if (file.endsWith(".download")) continue
      const relative = toPosix(path.relative(root, file))
      hashes[relative] = await sha256File(file)
    }
  }
  return hashes
}

async function walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walkFiles(full)))
    else if (entry.isFile()) files.push(full)
  }
  return files
}

async function sha256File(file) {
  const hash = crypto.createHash("sha256")
  const stream = fsSync.createReadStream(file)
  for await (const chunk of stream) hash.update(chunk)
  return hash.digest("hex")
}

async function runWithConcurrency(items, limit, worker) {
  const queue = [...items]
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (queue.length) {
      const item = queue.shift()
      if (item) await worker(item)
    }
  })
  await Promise.all(runners)
}

function instancePath(instanceId) {
  return path.join(app.getPath("userData"), "instances", sanitizeSegment(instanceId))
}

function instanceStatePath(root) {
  return path.join(root, "instance-state.json")
}

function safeResolve(root, relativePath) {
  const resolved = path.resolve(root, ...toPosix(relativePath).split("/"))
  const normalizedRoot = path.resolve(root)
  if (resolved !== normalizedRoot && !resolved.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error(`Caminho invalido no manifest: ${relativePath}`)
  }
  return resolved
}

function sanitizeSegment(value) {
  return String(value || "default").replace(/[^a-zA-Z0-9_.-]/g, "_")
}

function toPosix(value) {
  return String(value).replace(/\\/g, "/")
}

function displayName(filePath) {
  return filePath.split("/").pop() || filePath
}

function isProtected(filePath, patterns) {
  return patterns.some((pattern) => globToRegex(pattern).test(filePath))
}

function globToRegex(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp(`^${escaped}$`, "i")
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw new Error("Operacao cancelada.")
}

function emitLaunchProgress(progress) {
  mainWindow?.webContents.send("launch:progress", progress)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
