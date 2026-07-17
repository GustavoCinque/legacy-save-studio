export const FILES = ["playerdata.json", "unitinventory.json", "parties.json"] as const;
export const TYPES = ["Lord", "Anima", "Breaker", "Guardian", "Oracle", "Rex"] as const;
export const ELEMENTS = ["Unknown", "Fire", "Water", "Earth", "Thunder", "Light", "Dark"] as const;
export const UNIT_FIELDS = ["type", "currentLevel", "currentExperience", "currentBBLevel", "currentSBBLevel", "hpLevelUpBonus", "atkLevelUpBonus", "defLevelUpBonus", "recLevelUpBonus", "hpImpBonus", "atkImpBonus", "defImpBonus", "recImpBonus"] as const;

export type JsonObject = Record<string, unknown>;
export type UnitRecord = Record<(typeof UNIT_FIELDS)[number], number> & { unitId: string; [key: string]: unknown };
export interface UnitInfo { unitId: number; unitName?: string; unitNumber?: number; element?: number; elementName?: string; rarity?: number; maxLevel?: number; evoFrom?: number | null; evoInto?: number | null; sbbAbility?: unknown; sbbId?: unknown; [key: string]: unknown }
export interface SaveBundle { player: JsonObject; inventory: JsonObject; parties: JsonObject }

export function asInt(value: unknown, label: string): number {
  if (typeof value === "string" && value.trim() === "") throw new Error(`${label}: expected an integer`);
  const n = Number(value);
  if (!Number.isInteger(n)) throw new Error(`${label}: expected an integer, received ${String(value)}`);
  return n;
}

export function owned(bundle: SaveBundle): Record<string, UnitRecord> {
  const value = bundle.inventory.playerUnits;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, UnitRecord> : {};
}

export function cloneBundle(bundle: SaveBundle): SaveBundle { return structuredClone(bundle); }

export function toggleSelection(current: string[], key: string, multiple: boolean): string[] {
  if (!multiple) return [key];
  return current.includes(key) ? current.filter(item => item !== key) : [...current, key];
}

export function matchesRarity(rarity: unknown, filter: string): boolean {
  if (filter === "Todos") return true;
  const selected = filter.match(/^\d+/)?.[0];
  return selected !== undefined && String(rarity) === selected;
}

export function selectFiltered(current: string[], filteredKeys: string[]): string[] {
  return [...new Set([...current, ...filteredKeys])];
}

export function freeKey(bundle: SaveBundle): number {
  const used = new Set(Object.keys(owned(bundle)).filter(k => /^\d+$/.test(k)).map(Number));
  let key = asInt(bundle.inventory.nextKey ?? 0, "nextKey");
  while (used.has(key)) key += 1;
  return key;
}

export function hasSbb(info: UnitInfo | undefined): boolean { return Boolean(info?.sbbAbility || info?.sbbId); }

export function addUnit(bundle: SaveBundle, info: UnitInfo, options: { type?: number; maxLevel?: boolean; maxBB?: boolean; maxSBB?: boolean } = {}): string {
  const type = options.type ?? 0;
  if (!TYPES[type]) throw new Error(`type must be between 0 and ${TYPES.length - 1}`);
  const key = freeKey(bundle);
  const record: UnitRecord = {
    unitId: String(info.unitId), type,
    currentLevel: options.maxLevel ? asInt(info.maxLevel ?? 1, "maxLevel") : 1,
    currentExperience: 0, currentBBLevel: options.maxBB ? 10 : 1,
    currentSBBLevel: options.maxSBB && hasSbb(info) ? 10 : 1,
    hpLevelUpBonus: 0, atkLevelUpBonus: 0, defLevelUpBonus: 0, recLevelUpBonus: 0,
    hpImpBonus: 0, atkImpBonus: 0, defImpBonus: 0, recImpBonus: 0,
  };
  if (!bundle.inventory.playerUnits || typeof bundle.inventory.playerUnits !== "object") bundle.inventory.playerUnits = {};
  (bundle.inventory.playerUnits as Record<string, UnitRecord>)[String(key)] = record;
  bundle.inventory.nextKey = key + 1;
  if (!Array.isArray(bundle.player.unitDex)) bundle.player.unitDex = [];
  const dex = bundle.player.unitDex as unknown[];
  if (!dex.some(x => String(x) === String(info.unitId))) dex.push(String(info.unitId));
  return String(key);
}

export function references(bundle: SaveBundle, inventoryKey: string): string[] {
  const out: string[] = [];
  const parties = bundle.parties.parties;
  if (!parties || typeof parties !== "object") return out;
  for (const [partyKey, rawParty] of Object.entries(parties as Record<string, JsonObject>)) {
    const slots = rawParty.slots;
    if (!slots || typeof slots !== "object") continue;
    for (const [slot, key] of Object.entries(slots as JsonObject)) if (String(key) === inventoryKey) out.push(`party ${partyKey}, slot ${slot}`);
  }
  return out;
}

export function deleteUnits(bundle: SaveBundle, keys: string[]): string[] {
  const refs = keys.flatMap(key => references(bundle, key).map(ref => `${key}: ${ref}`));
  const units = owned(bundle);
  keys.forEach(key => delete units[key]);
  return refs;
}

export function validateBundle(bundle: SaveBundle): string[] {
  const errors: string[] = [];
  if (!bundle.player || typeof bundle.player !== "object") return ["playerdata is not a JSON object"];
  if (!bundle.inventory || typeof bundle.inventory !== "object") return ["unitinventory is not a JSON object"];
  if (!("nextKey" in bundle.inventory) || !("playerUnits" in bundle.inventory)) errors.push("unitinventory must contain nextKey and playerUnits");
  const units = owned(bundle); const numericKeys: number[] = [];
  for (const [key, unit] of Object.entries(units)) {
    if (!/^\d+$/.test(key)) errors.push(`inventory key is not numeric: ${key}`); else numericKeys.push(Number(key));
    if (!unit || typeof unit !== "object") { errors.push(`record ${key} is invalid`); continue; }
    if (!("unitId" in unit) || !("type" in unit)) errors.push(`record ${key}: unitId/type missing`);
    try { if (!TYPES[asInt(unit.type, "type")]) errors.push(`record ${key}: type is outside 0-${TYPES.length - 1}`); } catch { errors.push(`record ${key}: type is not numeric`); }
    try { if (asInt(unit.currentLevel ?? 0, "level") < 1) errors.push(`record ${key}: level is lower than 1`); } catch { errors.push(`record ${key}: level is not numeric`); }
  }
  try { const next = asInt(bundle.inventory.nextKey, "nextKey"); if (numericKeys.length && next <= Math.max(...numericKeys)) errors.push(`nextKey ${next} is not greater than the highest key ${Math.max(...numericKeys)}`); } catch { errors.push("nextKey is not numeric"); }
  const dex = bundle.player.unitDex;
  if (!Array.isArray(dex)) errors.push("unitDex is not an array"); else if (dex.length !== new Set(dex.map(String)).size) errors.push("unitDex contains duplicates");
  const partyMap = bundle.parties?.parties;
  if (!partyMap || typeof partyMap !== "object") errors.push("parties.json does not contain a parties object");
  else for (const [partyKey, raw] of Object.entries(partyMap as Record<string, JsonObject>)) {
    const slots = raw?.slots;
    if (!slots || typeof slots !== "object") { errors.push(`party ${partyKey}: invalid slots object`); continue; }
    for (const [slot, key] of Object.entries(slots as JsonObject)) if (!(String(key) in units)) errors.push(`party ${partyKey}, slot ${slot}: inventory key ${String(key)} does not exist`);
    const leader = raw.leaderUnitIndex;
    const hasLeaderSlot = String(leader ?? "") in (slots as JsonObject);
    const hasNoLeader = leader === 0 && Object.keys(slots as JsonObject).length === 0;
    if (!hasLeaderSlot && !hasNoLeader) errors.push(`party ${partyKey}: invalid leaderUnitIndex`);
  }
  return errors;
}

export function serializeJson(data: unknown): string { return `${JSON.stringify(data, null, 2)}\n`; }
