const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("aetherion", {
  window: {
    minimize: () => ipcRenderer.send("window:minimize"),
    maximize: () => ipcRenderer.send("window:maximize"),
    close: () => ipcRenderer.send("window:close"),
  },
  launch: {
    start: (args) => ipcRenderer.invoke("launch:start", args),
    cancel: () => ipcRenderer.invoke("launch:cancel"),
    onProgress: (cb) => {
      const listener = (_event, progress) => cb(progress)
      ipcRenderer.on("launch:progress", listener)
      return () => ipcRenderer.off("launch:progress", listener)
    },
  },
  accounts: {
    list: () => ipcRenderer.invoke("accounts:list"),
    addOffline: (username) => ipcRenderer.invoke("accounts:addOffline", username),
    addMicrosoft: () => ipcRenderer.invoke("accounts:addMicrosoft"),
    remove: (id) => ipcRenderer.invoke("accounts:remove", id),
    setActive: (id) => ipcRenderer.invoke("accounts:setActive", id),
    getDataPath: () => ipcRenderer.invoke("accounts:getDataPath"),
  },
})
