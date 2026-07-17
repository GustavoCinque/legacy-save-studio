const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("legacyStudio", {
  isElectron: true,
  getDefaultSavePath: () => ipcRenderer.invoke("save:get-default-path"),
  selectSaveDirectory: () => ipcRenderer.invoke("save:select-directory"),
  loadSave: directory => ipcRenderer.invoke("save:load", directory),
  saveBundle: (directory, bundle) => ipcRenderer.invoke("save:write", { directory, bundle }),
  listBackups: directory => ipcRenderer.invoke("save:list-backups", directory),
  restoreBackup: (directory, backupName) => ipcRenderer.invoke("save:restore", { directory, backupName }),
  openDirectory: directory => ipcRenderer.invoke("shell:open-directory", directory),
});
