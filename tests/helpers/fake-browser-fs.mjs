export class FakeFileHandle {
  constructor(text = "") { this.content = text; }
  async getFile() { return { text: async () => this.content, lastModified: Date.now() }; }
  async createWritable() {
    return { write: async value => { this.pending = String(value); }, close: async () => { this.content = this.pending ?? ""; } };
  }
}

export class FakeDirectoryHandle {
  constructor(name) { this.name = name; this.files = new Map(); this.directories = new Map(); }
  async getFileHandle(name, options = {}) {
    if (!this.files.has(name) && options.create) this.files.set(name, new FakeFileHandle());
    if (!this.files.has(name)) throw new DOMException(`Missing ${name}`, "NotFoundError");
    return this.files.get(name);
  }
  async getDirectoryHandle(name, options = {}) {
    if (!this.directories.has(name) && options.create) this.directories.set(name, new FakeDirectoryHandle(name));
    if (!this.directories.has(name)) throw new DOMException(`Missing ${name}`, "NotFoundError");
    return this.directories.get(name);
  }
  async *values() {
    for (const name of this.files.keys()) yield { kind: "file", name };
    for (const name of this.directories.keys()) yield { kind: "directory", name };
  }
}

export function saveDirectory(bundle) {
  const directory = new FakeDirectoryHandle("Brave Frontier_ Legacy");
  const values = [bundle.player, bundle.inventory, bundle.parties];
  ["playerdata.json", "unitinventory.json", "parties.json"].forEach((name, index) => directory.files.set(name, new FakeFileHandle(`${JSON.stringify(values[index])}\n`)));
  return directory;
}
