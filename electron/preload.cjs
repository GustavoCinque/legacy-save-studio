const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("legacyStudio", {
  isElectron: true,
  getDefaultSavePath: () => ipcRenderer.invoke("save:get-default-path"),
  selectSaveDirectory: () => ipcRenderer.invoke("save:select-directory"),
  loadSave: directory => ipcRenderer.invoke("save:load", directory),
  saveBundle: (directory, bundle) => ipcRenderer.invoke("save:write", { directory, bundle }),
  listBackups: directory => ipcRenderer.invoke("save:list-backups", directory),
  deleteBackups: (directory, backupName) => ipcRenderer.invoke("save:delete-backups", { directory, backupName }),
  restoreBackup: (directory, backupName) => ipcRenderer.invoke("save:restore", { directory, backupName }),
  openDirectory: directory => ipcRenderer.invoke("shell:open-directory", directory),
  openSaveFile: (directory, fileName) => ipcRenderer.invoke("shell:open-save-file", { directory, fileName }),
});
