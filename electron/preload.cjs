const { contextBridge, ipcRenderer } = require("electron");

// Expose safe desktop integration APIs to window.electronAPI
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  selectFolder: () => ipcRenderer.invoke("dialog:open-directory"),
  saveCrops: (crops) => ipcRenderer.invoke("crops:save", { crops }),
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
});
