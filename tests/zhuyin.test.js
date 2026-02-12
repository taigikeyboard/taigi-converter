import { describe, it } from "node:test";
import { strictEqual, ok } from "node:assert";
import { fromZhuyin, isZhuyin, toZhuyin } from "../src/zhuyin.js";

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
  it("standalone m", () => strictEqual(toZhuyin("m1"), "\u31ac "));
  it("standalone ng", () => strictEqual(toZhuyin("ng1"), "\u31ad "));
  it("nasal vowel", () => strictEqual(toZhuyin("ann1"), "\u31a9 "));
  it("multi char consonant tshi", () => strictEqual(toZhuyin("tshi1"), "\u3111\u3127 "));
  it("nasalized inn after palatalized ts", () => strictEqual(toZhuyin("tsinn5"), "\u3110\u31aa\u02ca"));
  it("nasalized inn after palatalized tsh", () => strictEqual(toZhuyin("tshinn5"), "\u3111\u31aa\u02ca"));
  it("punctuation comma", () => ok(toZhuyin("ka1,").includes("\uff0c")));
  it("punctuation period", () => ok(toZhuyin("ka1.").includes("\u3002")));
});

describe("isZhuyin", () => {
  it("detects TPS characters", () => ok(isZhuyin("\u3105\u311a ")));
  it("rejects plain latin", () => ok(!isZhuyin("ka2")));
  it("rejects empty string", () => ok(!isZhuyin("")));
});

describe("fromZhuyin", () => {
  it("simple syllable ka2", () => strictEqual(fromZhuyin("\u310d\u311a\u02cb"), "ka2"));
  it("tone 1 with space", () => strictEqual(fromZhuyin("\u310d\u311a "), "ka1"));
  it("tone 3", () => strictEqual(fromZhuyin("\u310d\u311a\u02ea"), "ka3"));
  it("tone 5", () => strictEqual(fromZhuyin("\u310d\u311a\u02ca"), "ka5"));
  it("tone 7", () => strictEqual(fromZhuyin("\u310d\u311a\u02eb"), "ka7"));
  it("stop tone p4", () => strictEqual(fromZhuyin("\u310d\u311a\u31b4"), "kap4"));
  it("stop tone t4", () => strictEqual(fromZhuyin("\u310d\u311a\u31b5"), "kat4"));
  it("stop tone k4", () => strictEqual(fromZhuyin("\u310d\u311a\u31b6"), "kak4"));
  it("stop tone h4", () => strictEqual(fromZhuyin("\u310d\u311a\u31b7"), "kah4"));
  it("stop tone p8 standard", () => strictEqual(fromZhuyin("\u310d\u311a\u31b4\u0307"), "kap8"));
  it("stop tone p8 encode safe", () => strictEqual(fromZhuyin("\u310d\u311a\u31b4\u02d9"), "kap8"));
  it("standalone m", () => strictEqual(fromZhuyin("\u31ac "), "m1"));
  it("standalone ng", () => strictEqual(fromZhuyin("\u31ad "), "ng1"));
  it("ng as vowel", () => strictEqual(fromZhuyin("\u31ad\u02ca"), "ng5"));
  it("nasal vowel ann", () => strictEqual(fromZhuyin("\u31a9 "), "ann1"));
  it("multi char initial tshi", () => strictEqual(fromZhuyin("\u3111\u3127 "), "tshi1"));
  it("compound vowel iau", () => strictEqual(fromZhuyin("\u3109\u3127\u3120 "), "tiau1"));
  it("multi syllable", () => strictEqual(fromZhuyin("\u3119\u3128\u02ca\u3105\u31a4\u31b6\u0307"), "su5-pek8"));
  it("punctuation comma", () => strictEqual(fromZhuyin("\u310d\u311a \uff0c"), "ka1,"));
  it("punctuation period", () => strictEqual(fromZhuyin("\u310d\u311a \u3002"), "ka1."));
  it("newline preserved", () => strictEqual(fromZhuyin("\u310d\u311a \n\u3119\u3128\u02ca"), "ka1\nsu5"));
  it("aspirated ph", () => strictEqual(fromZhuyin("\u3106\u311a "), "pha1"));
  it("extra space between tone-marked syllables", () => strictEqual(fromZhuyin("\u310d\u311a\u02cb \u3119\u3128\u02ca"), "ka2-su5"));
  it("palatalized initial without medial i", () => strictEqual(fromZhuyin("\u3110\u31aa\u02ca"), "tsinn5"));
  it("palatalized tsh without medial i", () => strictEqual(fromZhuyin("\u3111\u31aa\u02ca"), "tshinn5"));
});
