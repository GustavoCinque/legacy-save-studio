import type { SaveBundle } from "./editor-core";

export const BROWSER_SAVE_TOKEN = "browser://selected-save";
export const SAVE_FILES = ["playerdata.json", "unitinventory.json", "parties.json"] as const;

type BrowserFile = { text(): Promise<string>; lastModified?: number };
type WritableFile = { write(data: string): Promise<void>; close(): Promise<void> };
export type BrowserFileHandle = { getFile(): Promise<BrowserFile>; createWritable(): Promise<WritableFile> };
export type BrowserDirectoryHandle = {
  name: string;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<BrowserFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<BrowserDirectoryHandle>;
  values(): AsyncIterable<{ kind: "file" | "directory"; name: string }>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
};

export type BrowserPicker = () => Promise<BrowserDirectoryHandle>;
export type BrowserJsonOpener = (name: string, contents: Promise<string>) => void | Promise<void>;

async function openJsonInBrowser(_name: string, contents: Promise<string>): Promise<void> {
  const opened = window.open("about:blank", "_blank");
  if (!opened) throw new Error("The browser blocked the JSON window");
  try {
    const url = URL.createObjectURL(new Blob([await contents], { type: "application/json" }));
    opened.location.href = url;
  } catch (error) {
    opened.close();
    throw error;
  }
}

function timestamp(date = new Date()): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}_${pad(date.getMilliseconds(), 3)}`;
}

function parseObject(text: string, name: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text.replace(/^\uFEFF/, ""));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must contain a JSON object`);
  return value as Record<string, unknown>;
}

async function readBundle(directory: BrowserDirectoryHandle): Promise<SaveBundle> {
  const values = await Promise.all(SAVE_FILES.map(async name => {
    const file = await directory.getFileHandle(name).then(handle => handle.getFile());
    return parseObject(await file.text(), name);
  }));
  return { player: values[0], inventory: values[1], parties: values[2] };
}

async function writeBundle(directory: BrowserDirectoryHandle, bundle: SaveBundle): Promise<void> {
  const values = [bundle.player, bundle.inventory, bundle.parties];
  if (values.some(value => !value || typeof value !== "object" || Array.isArray(value))) throw new Error("Every save file must contain a JSON object");
  await Promise.all(SAVE_FILES.map(async (name, index) => {
    const handle = await directory.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(`${JSON.stringify(values[index], null, 2)}\n`);
    await writable.close();
  }));
}

async function copyBundle(source: BrowserDirectoryHandle, target: BrowserDirectoryHandle): Promise<void> {
  await writeBundle(target, await readBundle(source));
}

export function createBrowserFileService(pickDirectory: BrowserPicker, openJson: BrowserJsonOpener = openJsonInBrowser) {
  let directory: BrowserDirectoryHandle | null = null;
  let backupSequence = 0;

  const requireDirectory = () => {
    if (!directory) throw new Error("Select a save folder first");
    return directory;
  };

  const createBackup = async (prefix = "backup") => {
    const source = requireDirectory();
    const name = `${prefix}_${timestamp()}_${backupSequence++}`;
    const backup = await source.getDirectoryHandle(name, { create: true });
    await copyBundle(source, backup);
    return { name, path: `${BROWSER_SAVE_TOKEN}/${name}` };
  };

  return {
    isElectron: false as const,
    async getDefaultSavePath() { throw new Error("Browser mode requires folder selection"); },
    async selectSaveDirectory() { directory = await pickDirectory(); return BROWSER_SAVE_TOKEN; },
    async loadSave() {
      const selected = requireDirectory();
      return { directory: { path: BROWSER_SAVE_TOKEN, name: selected.name }, bundle: await readBundle(selected) };
    },
    async saveBundle(_path: string, bundle: SaveBundle) {
      const backup = await createBackup();
      await writeBundle(requireDirectory(), bundle);
      return backup;
    },
    async listBackups() {
      const selected = requireDirectory();
      const backups: Array<{ name: string; modifiedAt: string }> = [];
      for await (const entry of selected.values()) {
        if (entry.kind === "directory" && entry.name.startsWith("backup_")) {
          const backup = await selected.getDirectoryHandle(entry.name);
          const file = await (await backup.getFileHandle(SAVE_FILES[0])).getFile();
          backups.push({ name: entry.name, modifiedAt: new Date(file.lastModified ?? Date.now()).toISOString() });
        }
      }
      return backups.sort((a, b) => b.name.localeCompare(a.name));
    },
    async deleteBackups(_path: string, backupName?: string) {
      const selected = requireDirectory();
      const names = backupName ? [backupName] : (await this.listBackups()).map(item => item.name);
      if (names.some(name => !/^backup_[\w-]+$/.test(name))) throw new Error("Invalid backup name");
      await Promise.all(names.map(name => selected.removeEntry(name, { recursive: true })));
      return names.length;
    },
    async restoreBackup(_path: string, backupName: string) {
      if (!/^backup_[\w-]+$/.test(backupName)) throw new Error("Invalid backup name");
      const selected = requireDirectory();
      const source = await selected.getDirectoryHandle(backupName);
      const restoredBundle = await readBundle(source);
      const safety = await createBackup("backup_before_restore");
      await writeBundle(selected, restoredBundle);
      return { directory: { path: BROWSER_SAVE_TOKEN, name: selected.name }, bundle: restoredBundle, safety };
    },
    async openSaveFile(_path: string, fileName: string) {
      if (!SAVE_FILES.includes(fileName as (typeof SAVE_FILES)[number])) throw new Error("Invalid save file name");
      const contents = requireDirectory().getFileHandle(fileName).then(handle => handle.getFile()).then(file => file.text());
      await openJson(fileName, contents);
      return true;
    },
    async openDirectory() { return false; },
  };
}

let browserService: ReturnType<typeof createBrowserFileService> | undefined;

export function getBrowserFileService() {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) return undefined;
  browserService ??= createBrowserFileService(() => (window as unknown as { showDirectoryPicker: BrowserPicker }).showDirectoryPicker());
  return browserService;
}
