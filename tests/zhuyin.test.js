import { describe, it } from "node:test";
import { strictEqual, ok } from "node:assert";
import { toZhuyin } from "../src/zhuyin.js";

describe("toZhuyin", () => {
  it("simple syllable", () => strictEqual(toZhuyin("pa1"), "\u3105\u311a "));
  it("aspirated", () => strictEqual(toZhuyin("pha1"), "\u3106\u311a "));
  it("tone 2", () => strictEqual(toZhuyin("ka2"), "\u310d\u311a\u02cb"));
  it("tone 3", () => strictEqual(toZhuyin("ka3"), "\u310d\u311a\u02ea"));
  it("tone 5", () => strictEqual(toZhuyin("ka5"), "\u310d\u311a\u02ca"));
  it("tone 7", () => strictEqual(toZhuyin("ka7"), "\u310d\u311a\u02eb"));
  it("stop tone p4", () => strictEqual(toZhuyin("kap4"), "\u310d\u311a\u31b4"));
  it("stop tone t4", () => strictEqual(toZhuyin("kat4"), "\u310d\u311a\u31b5"));
  it("stop tone k4", () => strictEqual(toZhuyin("kak4"), "\u310d\u311a\u31b6"));
  it("stop tone h4", () => strictEqual(toZhuyin("kah4"), "\u310d\u311a\u31b7"));
  it("tone p8 standard", () => strictEqual(toZhuyin("kap8"), "\u310d\u311a\u31b4\u0307"));
  it("tone p8 encode safe", () => strictEqual(toZhuyin("kap8", { encodeSafe: true }), "\u310d\u311a\u31b4\u02d9"));
  it("standalone m", () => strictEqual(toZhuyin("m1"), "\u3107\u31ac "));
  it("standalone ng", () => strictEqual(toZhuyin("ng1"), "\u312b "));
  it("nasal vowel", () => strictEqual(toZhuyin("ann1"), "\u31a9 "));
  it("multi char consonant tshi", () => strictEqual(toZhuyin("tshi1"), "\u3111\u3127 "));
  it("punctuation comma", () => ok(toZhuyin("ka1,").includes("\uff0c")));
  it("punctuation period", () => ok(toZhuyin("ka1.").includes("\u3002")));
});
