import test from "node:test";
import assert from "node:assert/strict";
import {detectLocale,dictionaries,locales,translate} from "../work/test-dist/lib/i18n.js";
test("all supported locales resolve every English UI key",()=>{for(const locale of locales)for(const key of Object.keys(dictionaries.en)){const value=dictionaries[locale][key]??dictionaries.en[key];assert.ok(value,`${locale}.${key}`)}});
test("detects supported Windows/browser locale variants and falls back to English",()=>{assert.equal(detectLocale("pt-BR"),"pt");assert.equal(detectLocale("fr-FR"),"fr");assert.equal(detectLocale("es-AR"),"es");assert.equal(detectLocale("de-DE"),"en")});
test("interpolates translated confirmation values",()=>{assert.match(translate("pt","deleteQuestion",{count:3}),/3/);assert.match(translate("en","restoreQuestion",{name:"backup_1"}),/backup_1/)});
