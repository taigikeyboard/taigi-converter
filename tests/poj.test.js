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

  it("nasal mark is lowercase superscript n", () => {
    const result = toPoj("p", "iann", "3");
    ok(result.includes("\u207f"));
  });

  // Uppercase nasal modifier \u1d3a (U+1D3A) parity with standard \u207f (U+207F).
  // iOS POJFormatter.swift:64 / Android TaigiPhonetics.kt:401-410 both treat
  // U+1D3A equivalently to U+207F in placePojToneMark's nasal-end and
  // suffix-set checks. Canonical previously only checked U+207F.
  //
  // PARITY-ONLY SCOPE: these tests call `toPoj` with a directly-crafted POJ
  // final containing U+1D3A. Canonical's own `convert()` pipeline normalizes
  // \u1d3a \u2192 "nn" upstream at phonetics.js::normalizeToTl and re-applies uppercase
  // only after assembly via converter.js::applyCase, so this code path is not
  // reached from canonical's public conversion API. The tests cover direct
  // assembler callers (e.g. iOS / Android / future Rust FFI) that pass
  // already-uppercased finals through `toPoj` \u2014 Phase IV-A onward.
  it("\u1d3a end-of-final parity (direct assembler call)", () => {
    // "oa\u1d3a" via the U+1D3A nasal-end branch should pick the same target
    // vowel as "oa\u207f" via the U+207F branch. The two outputs must be
    // identical apart from the nasal codepoint itself \u2014 that contract is what
    // breaks if the U+1D3A check is removed (the else branch would still
    // coincidentally pick first vowel, so the lone .includes("\u00f4") check
    // wouldn't catch a regression; the parity equality does).
    const upper = toPoj("k", "oa\u1d3a", "5");
    const lower = toPoj("k", "oa\u207f", "5");
    ok(upper.includes("\u00f4"), "U+1D3A path: \u00f4 expected, got " + upper);
    strictEqual(upper.replace("\u1d3a", "\u207f"), lower);
  });

  it("\u1d3ah suffix-set inclusion selects second vowel (direct assembler call)", () => {
    // "oa\u1d3ah" \u2014 the suffix lookahead at placePojToneMark sees '\u1d3a' as suffix[0].
    // With U+1D3A in the consonant set, the lookahead recognises it and
    // selects second vowel ('a'). Without the fix, '\u1d3a' was absent from the
    // set and the else branch defaulted to first vowel ('o'). This case
    // exercises the suffix-set diff that the U+1D3A fix actually corrects.
    const result = toPoj("k", "oa\u1d3ah", "5");
    ok(
      result.includes("\u00e2"),
      "\u1d3ah suffix should select second vowel \u00e2, got " + result,
    );
  });
});
