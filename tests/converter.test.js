import { describe, it } from "node:test";
import { strictEqual, ok, throws } from "node:assert";
import { convert, toToneNumber, toToneMark } from "../src/converter.js";
import { toZhuyin } from "../src/zhuyin.js";

describe("TailoTpsConverter consonants", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("basic consonant", () => strictEqual(cv("pa1"), "\u3105\u311a "));
  it("aspirated consonant", () => strictEqual(cv("pha1"), "\u3106\u311a "));
  it("multi char consonant tshi", () => strictEqual(cv("tshi1"), "\u3111\u3127 "));
  it("multi char consonant tsi", () => strictEqual(cv("tsi1"), "\u3110\u3127 "));
  it("ng consonant", () => strictEqual(cv("nga1"), "\u312b\u311a "));
});

describe("TailoTpsConverter vowels", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("single vowel", () => strictEqual(cv("a1"), "\u311a "));
  it("nasal vowel", () => strictEqual(cv("ann1"), "\u31a9 "));
  it("compound vowel", () => strictEqual(cv("ai1"), "\u311e "));
  it("double vowel oo", () => strictEqual(cv("oo1"), "\u31a6 "));
});

describe("TailoTpsConverter tones", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("tone 1", () => strictEqual(cv("ka1"), "\u310d\u311a "));
  it("tone 2", () => strictEqual(cv("ka2"), "\u310d\u311a\u02cb"));
  it("tone 3", () => strictEqual(cv("ka3"), "\u310d\u311a\u02ea"));
  it("tone 5", () => strictEqual(cv("ka5"), "\u310d\u311a\u02ca"));
  it("tone 7", () => strictEqual(cv("ka7"), "\u310d\u311a\u02eb"));
  it("tone p4", () => strictEqual(cv("kap4"), "\u310d\u311a\u31b4"));
  it("tone t4", () => strictEqual(cv("kat4"), "\u310d\u311a\u31b5"));
  it("tone k4", () => strictEqual(cv("kak4"), "\u310d\u311a\u31b6"));
  it("tone h4", () => strictEqual(cv("kah4"), "\u310d\u311a\u31b7"));
  it("tone p8 standard", () => strictEqual(cv("kap8"), "\u310d\u311a\u31b4\u0307"));
  it("tone p8 encode safe", () => {
    const result = "kap8".split("\n").map(line =>
      line.split(" ").map(t => toZhuyin(t, { encodeSafe: true })).join("")
    ).join("\n");
    strictEqual(result, "\u310d\u311a\u31b4\u02d9");
  });
});

describe("TailoTpsConverter special cases", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("standalone m", () => strictEqual(cv("m1"), "\u31ac "));
  it("standalone ng", () => strictEqual(cv("ng1"), "\u31ad "));
  it("ng with consonant", () => strictEqual(cv("kang1"), "\u310d\u3124 "));
});

describe("TailoTpsConverter punctuation", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("comma", () => ok(cv("ka1,").includes("\uff0c")));
  it("period", () => ok(cv("ka1.").includes("\u3002")));
  it("question mark", () => ok(cv("ka1?").includes("\uff1f")));
});

describe("TailoTpsConverter multi syllable", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("two syllables", () => strictEqual(cv("su5 pek8"), "\u3119\u3128\u02ca\u3105\u31a4\u31b6\u0307"));
  it("reference example", () => {
    const text = "tiau1 su5 pek8 te7 tshai2 un5 kan1,";
    const result = cv(text);
    strictEqual(result, "\u3109\u3127\u3120 \u3119\u3128\u02ca\u3105\u31a4\u31b6\u0307\u3109\u31a4\u02eb\u3118\u311e\u02cb\u3128\u3123\u02ca\u310d\u3122 \uff0c");
  });
});

describe("TailoTpsConverter multiline", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("multiline input", () => strictEqual(cv("ka1\nsu5"), "\u310d\u311a \n\u3119\u3128\u02ca"));
});

describe("convert API", () => {
  it("tl to poj basic", () => ok(convert("tshi\u016b-\u00e1", "tl", "poj").includes("chh")));
  it("poj to tl basic", () => ok(convert("chhi\u016b-\u00e1", "poj", "tl").includes("tsh")));
  it("tl to zhuyin", () => ok(convert("tshiu7 a2", "tl", "zhuyin").includes("\u3111\u3127\u3128\u02eb")));
  it("same system passthrough", () => strictEqual(convert("hello", "tl", "tl"), "hello"));
  it("unknown source", () => throws(() => convert("hello", "xyz", "tl"), /Unknown source/));
  it("unknown target", () => throws(() => convert("hello", "tl", "xyz"), /Unknown target/));
  it("zhuyin to tl", () => ok(convert("\u310d\u311a\u02cb", "zhuyin", "tl").includes("k\u00e1")));
  it("zhuyin to poj", () => ok(convert("\u3111\u3127\u3128\u02eb", "zhuyin", "poj").includes("chh")));
  it("tl to zhuyin uppercase", () => ok(convert("L\u0101u-b\u00fa", "tl", "zhuyin").includes("\u310c\u3120\u02eb")));
  it("tl to zhuyin space separated", () => {
    const result = convert("tshiu7 a2", "tl", "zhuyin");
    strictEqual(result, "\u3111\u3127\u3128\u02eb \u311a\u02cb");
  });
  it("tl to zhuyin punct separated", () => {
    const result = convert("s\u00ed, g\u00edn", "tl", "zhuyin");
    strictEqual(result, "\u3112\u3127\u02cb \uff0c \u30a3\u3127\u3123\u02cb".replace("\u30a3", "\u31a3"));
  });
  it("Han-ts\u00ee m\u0304-kiann lo\u030dh-th\u00f3o nu\u0101", () => {
    strictEqual(convert("Han-ts\u00ee m\u0304-kiann lo\u030dh-th\u00f3o nu\u0101", "tl", "zhuyin"),
      "\u310f\u3122 \u3110\u3127\u02ca \u31ac\u02eb \u310d\u3127\u31a9 \u310c\u311b\u31b7\u0307 \u310a\u31a6\u02cb \u310b\u3128\u311a\u02eb");
  });
  it("Tai5-uan5 Tai5-gi2 Lo5-ma2-ji7", () => {
    strictEqual(convert("Tai5-uan5 Tai5-gi2 Lo5-ma2-ji7", "tl", "zhuyin"),
      "\u3109\u311e\u02ca \u3128\u3122\u02ca \u3109\u311e\u02ca \u31a3\u3127\u02cb \u310c\u311b\u02ca \u3107\u311a\u02cb \u31a2\u3127\u02eb");
  });
  it("Oo kan-\u00e1 t\u00e9 t\u0101u-i\u00fb", () => {
    strictEqual(convert("Oo kan-\u00e1 t\u00e9 t\u0101u-i\u00fb", "tl", "zhuyin"),
      "\u31a6 \u310d\u3122 \u311a\u02cb \u3109\u31a4\u02cb \u3109\u3120\u02eb \u3127\u3128\u02ca");
  });
  it("Thinn-kong thi\u00e0nn g\u014dng-l\u00e2ng", () => {
    strictEqual(convert("Thinn-kong thi\u00e0nn g\u014dng-l\u00e2ng", "tl", "zhuyin"),
      "\u310a\u31aa \u310d\u31b2 \u310a\u3127\u31a9\u02ea \u31a3\u31b2\u02eb \u310c\u3124\u02ca");
  });
  it("Tsia\u030dh h\u00f3 t\u00e0u sio-p\u00f2", () => {
    strictEqual(convert("Tsia\u030dh h\u00f3 t\u00e0u sio-p\u00f2", "tl", "zhuyin"),
      "\u3110\u3127\u311a\u31b7\u0307 \u310f\u311b\u02cb \u3109\u3120\u02ea \u3112\u3127\u311b \u3105\u311b\u02ea");
  });
  it("Ts\u00fbn ku\u00e8 tsu\u00ed b\u00f4 h\u00fbn", () => {
    strictEqual(convert("Ts\u00fbn ku\u00e8 tsu\u00ed b\u00f4 h\u00fbn", "tl", "zhuyin"),
      "\u3117\u3128\u3123\u02ca \u310d\u3128\u31a4\u02ea \u3117\u3128\u3127\u02cb \u31a0\u311b\u02ca \u310f\u3128\u3123\u02ca");
  });
  it("\u016a tshu\u00ec k\u00f3ng kah b\u00f4 nu\u0101", () => {
    strictEqual(convert("\u016a tshu\u00ec k\u00f3ng kah b\u00f4 nu\u0101", "tl", "zhuyin"),
      "\u3128\u02eb \u3118\u3128\u3127\u02ea \u310d\u31b2\u02cb \u310d\u311a\u31b7 \u31a0\u311b\u02ca \u310b\u3128\u311a\u02eb");
  });
  it("Tsi\u030dt ki tsh\u00e1u, tsi\u030dt ti\u00e1m l\u014do", () => {
    strictEqual(convert("Tsi\u030dt ki tsh\u00e1u, tsi\u030dt ti\u00e1m l\u014do", "tl", "zhuyin"),
      "\u3110\u3127\u31b5\u0307 \u310d\u3127 \u3118\u3120\u02cb \uff0c \u3110\u3127\u31b5\u0307 \u3109\u3127\u31b0\u02cb \u310c\u31a6\u02eb");
  });
  it("tl to poj ing to eng", () => ok(convert("p\u00eeng", "tl", "poj").includes("\u00eang")));
  it("preserves non syllable text", () => ok(convert("hello-world", "tl", "poj").includes("-")));
  it("preserves case title", () => ok(convert("T\u00e2i-g\u00ed", "tl", "poj")[0] === "T"));
});

describe("toToneNumber", () => {
  it("basic", () => strictEqual(toToneNumber("k\u00e1"), "ka2"));
  it("tone 5", () => strictEqual(toToneNumber("k\u00e2"), "ka5"));
  it("tone 7", () => strictEqual(toToneNumber("k\u0101"), "ka7"));
  it("tone 8", () => strictEqual(toToneNumber("ka\u030dh"), "kah8"));
  it("already numbered", () => strictEqual(toToneNumber("ka2"), "ka2"));

  it("multi syllable", () => {
    const result = toToneNumber("G\u00e2u-ts\u00e1");
    ok(result.includes("5"));
    ok(result.includes("2"));
  });

  it("no tone", () => strictEqual(toToneNumber("ka"), "ka1"));
  it("stop tone no mark", () => strictEqual(toToneNumber("kah"), "kah4"));
});

describe("toToneMark", () => {
  it("basic tl", () => strictEqual(toToneMark("ka2"), "k\u00e1"));
  it("tone 5", () => strictEqual(toToneMark("ka5"), "k\u00e2"));
  it("tone 7", () => strictEqual(toToneMark("ka7"), "k\u0101"));
  it("tone 1 no mark", () => strictEqual(toToneMark("ka1"), "ka"));
  it("poj system", () => ok(toToneMark("tshiu7", "poj").includes("chh")));

  it("multi syllable hyphenated", () => {
    const result = toToneMark("tshiu7-a2");
    ok(result.includes("\u016b"));
    ok(result.includes("\u00e1"));
  });
});
