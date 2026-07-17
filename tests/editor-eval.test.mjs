import test from "node:test";
import assert from "node:assert/strict";
import { addUnit, matchesRarity, selectFiltered, TYPES, validateBundle } from "../work/test-dist/lib/editor-core.js";

const base=()=>({player:{unitDex:[]},inventory:{nextKey:0,playerUnits:{}},parties:{parties:{"0":{slots:{},leaderUnitIndex:0}}}});
test("eval: every generated unit type and upgrade option stays schema-valid",()=>{for(let type=0;type<TYPES.length;type++){const b=base();addUnit(b,{unitId:10011,maxLevel:150,sbbId:8},{type,maxLevel:true,maxBB:true,maxSBB:true});b.parties.parties["0"].slots["0"]="0";assert.deepEqual(validateBundle(b),[],`type ${type}`)}});
test("eval: broken references always block saving",()=>{const b=base();b.parties.parties["0"].slots["4"]="999";const errors=validateBundle(b);assert.equal(errors.filter(x=>x.includes("does not exist")).length,1)});
test("eval: empty parties consistently accept the game's no-leader representation",()=>{for(let nextKey=0;nextKey<25;nextKey++){const b=base();b.parties.nextKey=nextKey;assert.deepEqual(validateBundle(b),[],`nextKey ${nextKey}`)}});
test("eval: each star choice isolates its catalog rarity",()=>{const catalog=[0,1,2,3,4,5,6,7].map(rarity=>({rarity}));for(let rarity=0;rarity<=7;rarity++)assert.deepEqual(catalog.filter(unit=>matchesRarity(unit.rarity,String(rarity))),[{rarity}])});
test("eval: selecting changing filtered lists remains complete and duplicate-free",()=>{let selected=selectFiltered([],['1','2']);selected=selectFiltered(selected,['2','3']);selected=selectFiltered(selected,['1','3']);assert.deepEqual(selected,['1','2','3'])});
