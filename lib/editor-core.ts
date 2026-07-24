export const FILES = ["playerdata.json", "unitinventory.json", "parties.json"] as const;
export const TYPES = ["Lord", "Anima", "Breaker", "Guardian", "Oracle", "Rex"] as const;
export const ELEMENTS = ["Unknown", "Fire", "Water", "Earth", "Thunder", "Light", "Dark"] as const;
export const UNIT_FIELDS = ["type", "currentLevel", "currentExperience", "currentBBLevel", "currentSBBLevel", "hpLevelUpBonus", "atkLevelUpBonus", "defLevelUpBonus", "recLevelUpBonus", "hpImpBonus", "atkImpBonus", "defImpBonus", "recImpBonus"] as const;

export type JsonObject = Record<string, unknown>;
export type UnitRecord = Record<(typeof UNIT_FIELDS)[number], number> & { unitId: string; [key: string]: unknown };
export interface UnitInfo { unitId: number; unitName?: string; unitNumber?: number; element?: number; elementName?: string; rarity?: number; maxLevel?: number; evoFrom?: number | null; evoInto?: number | null; sbbAbility?: unknown; sbbId?: unknown; [key: string]: unknown }
export interface SaveBundle { player: JsonObject; inventory: JsonObject; parties: JsonObject }
export type InventorySortCriterion = "party" | "element" | "rarity" | "type" | "unitId" | "level" | "exp" | "bb" | "sbb";
export type InventorySortDirection = "asc" | "desc";
export type InventorySortRule = { criterion: InventorySortCriterion; direction: InventorySortDirection };
export type InventoryReorderResult = { moved: boolean; changed: number; mapping: Record<string, string> };

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

export function formatRarity(rarity: unknown, star: string, stars: string, omni: string): string {
  const internal = Number(rarity);
  if (!Number.isInteger(internal) || internal < 0 || internal > 7) return "—";
  if (internal === 7) return omni;
  const displayed = internal + 1;
  return `${displayed} ${displayed === 1 ? star : stars}`;
}

export function selectFiltered(current: string[], filteredKeys: string[]): string[] {
  return [...new Set([...current, ...filteredKeys])];
}

export function paginate<T>(items: T[], requestedPage: number, pageSize = 250): { items: T[]; page: number; totalPages: number; total: number } {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError("pageSize must be a positive integer");
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, totalPages, total: items.length };
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

function inventoryEntries(bundle: SaveBundle): [string, UnitRecord][] {
  return Object.entries(owned(bundle)).sort(([left], [right]) => {
    const leftNumeric = /^\d+$/.test(left); const rightNumeric = /^\d+$/.test(right);
    if (leftNumeric && rightNumeric) return Number(left) - Number(right);
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return left.localeCompare(right);
  });
}

function remapPartyReferences(bundle: SaveBundle, mapping: Map<string, string>): void {
  const parties = bundle.parties.parties;
  if (!parties || typeof parties !== "object") return;
  for (const party of Object.values(parties as Record<string, JsonObject>)) {
    const slots = party?.slots;
    if (!slots || typeof slots !== "object") continue;
    for (const [slot, oldKey] of Object.entries(slots as JsonObject)) {
      const next = mapping.get(String(oldKey));
      if (next !== undefined) (slots as JsonObject)[slot] = typeof oldKey === "number" ? Number(next) : next;
    }
  }
}

export function applyInventoryOrder(bundle: SaveBundle, orderedOldKeys: string[]): InventoryReorderResult {
  const entries = inventoryEntries(bundle);
  const slotKeys = entries.map(([key]) => key);
  if (orderedOldKeys.length !== slotKeys.length || new Set(orderedOldKeys).size !== slotKeys.length || orderedOldKeys.some(key => !(key in owned(bundle)))) {
    throw new Error("inventory order must contain every inventory key exactly once");
  }
  const mapping = new Map(orderedOldKeys.map((oldKey, index) => [oldKey, slotKeys[index]]));
  const units = owned(bundle);
  bundle.inventory.playerUnits = Object.fromEntries(orderedOldKeys.map((oldKey, index) => [slotKeys[index], units[oldKey]]));
  remapPartyReferences(bundle, mapping);
  const changed = orderedOldKeys.filter((oldKey, index) => oldKey !== slotKeys[index]).length;
  return { moved: changed > 0, changed, mapping: Object.fromEntries(mapping) };
}

export function inventorySelectionState(bundle: SaveBundle, selectedKeys: string[]): { contiguous: boolean; first: number; last: number; canUp: boolean; canDown: boolean } {
  const keys = inventoryEntries(bundle).map(([key]) => key);
  const indices = [...new Set(selectedKeys)].map(key => keys.indexOf(key)).filter(index => index >= 0).sort((a, b) => a - b);
  const contiguous = indices.length > 0 && indices.every((index, offset) => index === indices[0] + offset);
  const first = contiguous ? indices[0] : -1;
  const last = contiguous ? indices[indices.length - 1] : -1;
  return { contiguous, first, last, canUp: contiguous && first > 0, canDown: contiguous && last < keys.length - 1 };
}

export function toggleContiguousInventorySelection(current: string[], key: string, orderedKeys: string[]): string[] {
  const clicked = orderedKeys.indexOf(key);
  if (clicked < 0) return current.filter(item => orderedKeys.includes(item));
  const indices = [...new Set(current)].map(item => orderedKeys.indexOf(item)).filter(index => index >= 0).sort((a, b) => a - b);
  if (!indices.length) return [key];
  if (!current.includes(key)) {
    const first = Math.min(indices[0], clicked); const last = Math.max(indices[indices.length - 1], clicked);
    return orderedKeys.slice(first, last + 1);
  }
  const first = indices[0]; const last = indices[indices.length - 1];
  if (clicked === first) return orderedKeys.slice(first + 1, last + 1);
  if (clicked === last) return orderedKeys.slice(first, last);
  const above = clicked - first; const below = last - clicked;
  return above >= below ? orderedKeys.slice(first, clicked) : orderedKeys.slice(clicked + 1, last + 1);
}

export function moveInventoryBlock(bundle: SaveBundle, selectedKeys: string[], direction: "up" | "down"): InventoryReorderResult {
  const keys = inventoryEntries(bundle).map(([key]) => key);
  const state = inventorySelectionState(bundle, selectedKeys);
  if (!state.contiguous) throw new Error("selected inventory units must be adjacent");
  if ((direction === "up" && !state.canUp) || (direction === "down" && !state.canDown)) {
    return { moved: false, changed: 0, mapping: Object.fromEntries(keys.map(key => [key, key])) };
  }
  const ordered = [...keys];
  if (direction === "up") {
    const previous = ordered[state.first - 1];
    ordered.splice(state.first - 1, state.last - state.first + 2, ...ordered.slice(state.first, state.last + 1), previous);
  } else {
    const next = ordered[state.last + 1];
    ordered.splice(state.first, state.last - state.first + 2, next, ...ordered.slice(state.first, state.last + 1));
  }
  return applyInventoryOrder(bundle, ordered);
}

export function organizeInventory(bundle: SaveBundle, requestedCriteria: InventorySortCriterion | InventorySortRule | readonly (InventorySortCriterion | InventorySortRule)[], infoById: ReadonlyMap<number, UnitInfo>): InventoryReorderResult {
  const entries = inventoryEntries(bundle);
  const requested = Array.isArray(requestedCriteria) ? requestedCriteria : [requestedCriteria];
  const rules = requested.map(item => typeof item === "string" ? { criterion: item, direction: "asc" as const } : item).filter((rule, index, all) => all.findIndex(item => item.criterion === rule.criterion) === index);
  if (!rules.length) return { moved: false, changed: 0, mapping: Object.fromEntries(entries.map(([key]) => [key, key])) };
  const referenced = new Set<string>();
  const parties = bundle.parties.parties;
  if (parties && typeof parties === "object") for (const party of Object.values(parties as Record<string, JsonObject>)) {
    const slots = party?.slots;
    if (slots && typeof slots === "object") Object.values(slots as JsonObject).forEach(key => referenced.add(String(key)));
  }
  const score = ([key, unit]: [string, UnitRecord], criterion: InventorySortCriterion): number => {
    const info = infoById.get(Number(unit.unitId));
    if (criterion === "party") return referenced.has(key) ? 0 : 1;
    if (criterion === "element") { const index = ELEMENTS.indexOf(String(info?.elementName) as typeof ELEMENTS[number]); return index >= 0 ? index : Number.MAX_SAFE_INTEGER; }
    if (criterion === "rarity") { const rarity = Number(info?.rarity); return Number.isInteger(rarity) && rarity >= 0 && rarity <= 7 ? rarity : Number.MAX_SAFE_INTEGER; }
    if (criterion === "unitId") { const unitId = Number(unit.unitId); return Number.isFinite(unitId) ? unitId : Number.MAX_SAFE_INTEGER; }
    if (criterion === "level") { const level = Number(unit.currentLevel); return Number.isFinite(level) ? level : Number.MAX_SAFE_INTEGER; }
    if (criterion === "exp") { const exp = Number(unit.currentExperience); return Number.isFinite(exp) ? exp : Number.MAX_SAFE_INTEGER; }
    if (criterion === "bb") { const bb = Number(unit.currentBBLevel); return Number.isFinite(bb) ? bb : Number.MAX_SAFE_INTEGER; }
    if (criterion === "sbb") { const sbb = Number(unit.currentSBBLevel); return Number.isFinite(sbb) ? sbb : Number.MAX_SAFE_INTEGER; }
    const type = Number(unit.type);
    return Number.isInteger(type) && type >= 0 && type < TYPES.length ? type : Number.MAX_SAFE_INTEGER;
  };
  const ordered = entries.map((entry, index) => ({ entry, index, scores: rules.map(rule => score(entry, rule.criterion)) })).sort((left, right) => {
    for (let index = 0; index < rules.length; index++) if (left.scores[index] !== right.scores[index]) return (left.scores[index] - right.scores[index]) * (rules[index].direction === "asc" ? 1 : -1);
    return left.index - right.index;
  }).map(item => item.entry[0]);
  return applyInventoryOrder(bundle, ordered);
}

export function normalizeInventoryKeys(bundle: SaveBundle): { changed: number; nextKey: number } {
  const entries = inventoryEntries(bundle);
  const mapping = new Map(entries.map(([oldKey], index) => [oldKey, String(index)]));
  bundle.inventory.playerUnits = Object.fromEntries(entries.map(([oldKey, unit]) => [mapping.get(oldKey), unit]));
  bundle.inventory.nextKey = entries.length;
  remapPartyReferences(bundle, mapping);
  return { changed: entries.filter(([oldKey], index) => oldKey !== String(index)).length, nextKey: entries.length };
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
