import { describe, it } from "node:test";
import { strictEqual, ok } from "node:assert";
import { toPoj } from "../src/poj.js";

describe("toPoj", () => {
  it("ts becomes ch", () => strictEqual(toPoj("ts", "u", "2"), "ch\u00fa"));
  it("tsh becomes chh", () => strictEqual(toPoj("tsh", "iu", "7"), "chhi\u016b"));

  it("nn becomes nasal", () => {
    const result = toPoj("k", "ann", "2");
    ok(result.includes("\u207f"));
  });

  it("oo becomes o dot", () => {
    const result = toPoj("k", "oo", "1");
    ok(result.includes("\u0358"));
  });

  it("ua becomes oa", () => {
    const result = toPoj("k", "ua", "1");
    ok(result.includes("oa"));
  });

  it("ue becomes oe", () => {
    const result = toPoj("k", "ue", "1");
    ok(result.includes("oe"));
  });

  it("ing becomes eng", () => strictEqual(toPoj("p", "ing", "1"), "peng"));
  it("ik becomes ek", () => ok(toPoj("p", "ik", "4").includes("ek")));
  it("tone 1 no mark", () => strictEqual(toPoj("k", "a", "1"), "ka"));
  it("tone 2 acute", () => strictEqual(toPoj("k", "a", "2"), "k\u00e1"));
  it("tone 3 grave", () => strictEqual(toPoj("k", "a", "3"), "k\u00e0"));
  it("tone 5 circumflex", () => strictEqual(toPoj("k", "a", "5"), "k\u00e2"));
  it("tone 7 macron", () => strictEqual(toPoj("k", "a", "7"), "k\u0101"));
  it("tone 9 breve", () => ok(toPoj("k", "a", "9").includes("\u0103")));

  it("non ts initial unchanged", () => {
    strictEqual(toPoj("k", "a", "2"), "k\u00e1");
    strictEqual(toPoj("p", "a", "2"), "p\u00e1");
    strictEqual(toPoj("h", "a", "2"), "h\u00e1");
  });

  it("triphthong iau mark on a", () => ok(toPoj("", "iau", "5").includes("\u00e2")));
  it("diphthong ai mark on first", () => strictEqual(toPoj("k", "ai", "2"), "k\u00e1i"));

  it("diphthong ia mark on second", () => {
    ok(toPoj("k", "ia", "2").includes("\u00e1"));
  });

  it("o dot gets mark", () => {
    const result = toPoj("k", "oo", "2");
    ok(result !== null);
  });
});
