const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const FILES = ["playerdata.json", "unitinventory.json", "parties.json"];

function defaultSavePath() {
  const home = os.homedir();
  return path.join(home, "AppData", "LocalLow", "CalebsGames", "Brave Frontier_ Legacy");
}

function assertSaveDirectory(directory) {
  if (typeof directory !== "string" || !path.isAbsolute(directory)) throw new Error("Pasta de save inválida");
  const missing = FILES.filter(name => !fs.existsSync(path.join(directory, name)));
  if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(", ")}`);
  return path.resolve(directory);
}

function readJson(filePath) {
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const value = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path.basename(filePath)} deve conter um objeto JSON`);
  return value;
}

function loadSave(directory) {
  const resolved = assertSaveDirectory(directory);
  const [player, inventory, parties] = FILES.map(name => readJson(path.join(resolved, name)));
  return { directory: { path: resolved, name: path.basename(resolved) }, bundle: { player, inventory, parties } };
}

function timestamp() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}_${String(d.getMilliseconds()).padStart(3,"0")}`;
}

function createBackup(directory, prefix = "backup") {
  const resolved = assertSaveDirectory(directory);
  const backupPath = path.join(resolved, `${prefix}_${timestamp()}`);
  fs.mkdirSync(backupPath, { recursive: false });
  for (const name of FILES) fs.copyFileSync(path.join(resolved, name), path.join(backupPath, name), fs.constants.COPYFILE_EXCL);
  return { name: path.basename(backupPath), path: backupPath };
}

function serialize(value) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  JSON.parse(text);
  return text;
}

function saveBundle(directory, bundle) {
  const resolved = assertSaveDirectory(directory);
  if (!bundle || typeof bundle !== "object") throw new Error("Dados do save inválidos");
  const values = [bundle.player, bundle.inventory, bundle.parties];
  if (values.some(value => !value || typeof value !== "object" || Array.isArray(value))) throw new Error("Todos os saves devem ser objetos JSON");
  const backup = createBackup(resolved);
  const tempPaths = [];
  try {
    FILES.forEach((name, index) => {
      const temporary = path.join(resolved, `.${name}.${process.pid}.${Date.now()}.tmp`);
      fs.writeFileSync(temporary, serialize(values[index]), { encoding: "utf8", flag: "wx" });
      const fd = fs.openSync(temporary, "r+"); fs.fsyncSync(fd); fs.closeSync(fd); tempPaths.push(temporary);
    });
    FILES.forEach((name, index) => fs.renameSync(tempPaths[index], path.join(resolved, name)));
    return backup;
  } finally {
    tempPaths.forEach(file => { if (fs.existsSync(file)) fs.unlinkSync(file); });
  }
}

function listBackups(directory) {
  const resolved = assertSaveDirectory(directory);
  return fs.readdirSync(resolved, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name.startsWith("backup_")).map(entry => ({ name: entry.name, modifiedAt: fs.statSync(path.join(resolved, entry.name)).mtime.toISOString() })).sort((a,b) => b.name.localeCompare(a.name));
}

function safeBackupPath(directory, backupName) {
  if (typeof backupName !== "string" || !/^backup_[\w-]+$/.test(backupName)) throw new Error("Nome de backup inválido");
  const resolved = path.resolve(directory); const candidate = path.resolve(resolved, backupName);
  if (path.dirname(candidate) !== resolved) throw new Error("Backup fora da pasta do save");
  return assertSaveDirectory(candidate);
}

function restoreBackup(directory, backupName) {
  const resolved = assertSaveDirectory(directory); const source = safeBackupPath(resolved, backupName);
  const values = FILES.map(name => readJson(path.join(source, name)));
  const safety = createBackup(resolved, "backup_before_restore");
  saveBundleWithoutBackup(resolved, { player: values[0], inventory: values[1], parties: values[2] });
  return { safety, ...loadSave(resolved) };
}

function saveBundleWithoutBackup(directory, bundle) {
  const temp = FILES.map((name, i) => { const file=path.join(directory, `.${name}.${process.pid}.restore.tmp`); fs.writeFileSync(file, serialize([bundle.player,bundle.inventory,bundle.parties][i]), "utf8"); return file; });
  try { FILES.forEach((name,i)=>fs.renameSync(temp[i],path.join(directory,name))); } finally { temp.forEach(file=>{if(fs.existsSync(file))fs.unlinkSync(file)}); }
}

module.exports = { FILES, defaultSavePath, assertSaveDirectory, loadSave, createBackup, saveBundle, listBackups, restoreBackup };
