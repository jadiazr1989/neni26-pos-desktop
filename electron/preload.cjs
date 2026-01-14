const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pos", {
  isPackaged: () => ipcRenderer.sendSync("pos:isPackaged"),

  storeGet: (key, fallback) => ipcRenderer.invoke("pos:store:get", key, fallback),
  storeSet: (key, value) => ipcRenderer.invoke("pos:store:set", key, value),
  storeRemove: (key) => ipcRenderer.invoke("pos:store:remove", key), // ✅

  terminalGet: () => ipcRenderer.invoke("pos:terminal:get"),
  terminalSet: (id) => ipcRenderer.invoke("pos:terminal:set", id),
});
