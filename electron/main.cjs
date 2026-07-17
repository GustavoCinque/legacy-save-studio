const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const service = require("./file-service.cjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1050, minHeight: 700,
    backgroundColor: "#f5f8f6", title: "Legacy Save Studio", autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  const devUrl = process.env.ELECTRON_DEV_URL;
  if (devUrl) win.loadURL(devUrl); else win.loadFile(path.join(__dirname, "..", "out", "index.html"));
}

ipcMain.handle("save:get-default-path", () => service.defaultSavePath());
ipcMain.handle("save:select-directory", async () => { const result=await dialog.showOpenDialog({ title:"Selecione a pasta do save", defaultPath:service.defaultSavePath(), properties:["openDirectory"] }); return result.canceled ? null : result.filePaths[0]; });
ipcMain.handle("save:load", (_event, directory) => service.loadSave(directory));
ipcMain.handle("save:write", (_event, {directory,bundle}) => service.saveBundle(directory,bundle));
ipcMain.handle("save:list-backups", (_event, directory) => service.listBackups(directory));
ipcMain.handle("save:restore", (_event, {directory,backupName}) => service.restoreBackup(directory,backupName));
ipcMain.handle("shell:open-directory", async (_event, directory) => { const resolved=service.assertSaveDirectory(directory); const error=await shell.openPath(resolved); if(error) throw new Error(error); return true; });

app.whenReady().then(() => { createWindow(); app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()}); });
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
