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
  it("tone k4", () => strictEqual(cv("kak4"), "\u310d\u311a\u31bb"));
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

  it("two syllables", () => strictEqual(cv("su5 pek8"), "\u3119\u3128\u02ca\u3105\u31a4\u31bb\u0307"));
  it("reference example", () => {
    const text = "tiau1 su5 pek8 te7 tshai2 un5 kan1,";
    const result = cv(text);
    strictEqual(result, "\u3109\u3127\u3120 \u3119\u3128\u02ca\u3105\u31a4\u31bb\u0307\u3109\u31a4\u02eb\u3118\u311e\u02cb\u3128\u3123\u02ca\u310d\u3122 \uff0c");
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
  it("Ts\u00ecng-l\u00e2ng \u00ea \u00ec-ki\u00e0n i it-kh\u00e0i hu\u00e1n-tu\u00ec.", () => {
    strictEqual(convert("Ts\u00ecng-l\u00e2ng \u00ea \u00ec-ki\u00e0n i it-kh\u00e0i hu\u00e1n-tu\u00ec.", "tl", "zhuyin"),
      "\u3110\u3127\u3125\u02ea \u310c\u3124\u02ca \u31a4\u02ca \u3127\u02ea \u310d\u3127\u3122\u02ea \u3127 \u3127\u31b5 \u310e\u311e\u02ea \u310f\u3128\u3122\u02cb \u3109\u3128\u3127\u02ea \u3002");
  });
  it("\u908a pinn", () => strictEqual(convert("pinn", "tl", "zhuyin"), "\u3105\u31aa"));
  it("\u5e03 p\u00f2o", () => strictEqual(convert("p\u00f2o", "tl", "zhuyin"), "\u3105\u31a6\u02ea"));
  it("\u76ae phu\u00ea", () => strictEqual(convert("phu\u00ea", "tl", "zhuyin"), "\u3106\u3128\u31a4\u02ca"));
  it("\u914d phu\u00e8", () => strictEqual(convert("phu\u00e8", "tl", "zhuyin"), "\u3106\u3128\u31a4\u02ea"));
  it("\u7dbf m\u00ee", () => strictEqual(convert("m\u00ee", "tl", "zhuyin"), "\u3107\u3127\u02ca"));
  it("\u9e35 m\u012b", () => strictEqual(convert("m\u012b", "tl", "zhuyin"), "\u3107\u3127\u02eb"));
  it("\u6587 b\u00fbn", () => strictEqual(convert("b\u00fbn", "tl", "zhuyin"), "\u31a0\u3128\u3123\u02ca"));
  it("\u6728 ba\u030dk", () => strictEqual(convert("ba\u030dk", "tl", "zhuyin"), "\u31a0\u311a\u31bb\u0307"));
  it("\u5927 tu\u0101", () => strictEqual(convert("tu\u0101", "tl", "zhuyin"), "\u3109\u3128\u311a\u02eb"));
  it("\u809a t\u014do", () => strictEqual(convert("t\u014do", "tl", "zhuyin"), "\u3109\u31a6\u02eb"));
  it("\u900f th\u00e0u", () => strictEqual(convert("th\u00e0u", "tl", "zhuyin"), "\u310a\u3120\u02ea"));
  it("\u5929 thinn", () => strictEqual(convert("thinn", "tl", "zhuyin"), "\u310a\u31aa"));
  it("\u5e74 n\u00ee", () => strictEqual(convert("n\u00ee", "tl", "zhuyin"), "\u310b\u3127\u02ca"));
  it("\u5a18 ni\u00e2", () => strictEqual(convert("ni\u00e2", "tl", "zhuyin"), "\u310b\u3127\u311a\u02ca"));
  it("\u4f86 l\u00e2i", () => strictEqual(convert("l\u00e2i", "tl", "zhuyin"), "\u310c\u311e\u02ca"));
  it("\u79ae l\u00e9", () => strictEqual(convert("l\u00e9", "tl", "zhuyin"), "\u310c\u31a4\u02cb"));
  it("\u8239 ts\u00fbn", () => strictEqual(convert("ts\u00fbn", "tl", "zhuyin"), "\u3117\u3128\u3123\u02ca"));
  it("\u65e9 ts\u00e1", () => strictEqual(convert("ts\u00e1", "tl", "zhuyin"), "\u3117\u311a\u02cb"));
  it("\u9322 ts\u00eenn", () => strictEqual(convert("ts\u00eenn", "tl", "zhuyin"), "\u3110\u31aa\u02ca"));
  it("\u524d ts\u00eeng", () => strictEqual(convert("ts\u00eeng", "tl", "zhuyin"), "\u3110\u3127\u3125\u02ca"));
  it("\u919b tsh\u00f2o", () => strictEqual(convert("tsh\u00f2o", "tl", "zhuyin"), "\u3118\u31a6\u02ea"));
  it("\u8349 tsh\u00e1u", () => strictEqual(convert("tsh\u00e1u", "tl", "zhuyin"), "\u3118\u3120\u02cb"));
  it("\u5343 tshing", () => strictEqual(convert("tshing", "tl", "zhuyin"), "\u3111\u3127\u3125"));
  it("\u4e03 tshit", () => strictEqual(convert("tshit", "tl", "zhuyin"), "\u3111\u3127\u31b5"));
  it("\u8607 soo", () => strictEqual(convert("soo", "tl", "zhuyin"), "\u3119\u31a6"));
  it("\u6d17 s\u00e9", () => strictEqual(convert("s\u00e9", "tl", "zhuyin"), "\u3119\u31a4\u02cb"));
  it("\u6d88 siau", () => strictEqual(convert("siau", "tl", "zhuyin"), "\u3112\u3127\u3120"));
  it("\u5148 sing", () => strictEqual(convert("sing", "tl", "zhuyin"), "\u3112\u3127\u3125"));
  it("\u71b1 jua\u030dh", () => strictEqual(convert("jua\u030dh", "tl", "zhuyin"), "\u31a1\u3128\u311a\u31b7\u0307"));
  it("\u8edf ju\u00e1n", () => strictEqual(convert("ju\u00e1n", "tl", "zhuyin"), "\u31a1\u3128\u3122\u02cb"));
  it("\u65e5 ji\u030dt", () => strictEqual(convert("ji\u030dt", "tl", "zhuyin"), "\u31a2\u3127\u31b5\u0307"));
  it("\u4e8c j\u012b", () => strictEqual(convert("j\u012b", "tl", "zhuyin"), "\u31a2\u3127\u02eb"));
  it("\u6b4c kua", () => strictEqual(convert("kua", "tl", "zhuyin"), "\u310d\u3128\u311a"));
  it("\u5149 kng", () => strictEqual(convert("kng", "tl", "zhuyin"), "\u310d\u31ad"));
  it("\u82e6 kh\u00f3o", () => strictEqual(convert("kh\u00f3o", "tl", "zhuyin"), "\u310e\u31a6\u02cb"));
  it("\u8003 kh\u00f3", () => strictEqual(convert("kh\u00f3", "tl", "zhuyin"), "\u310e\u311b\u02cb"));
  it("\u5433 ng\u00f4o", () => strictEqual(convert("ng\u00f4o", "tl", "zhuyin"), "\u312b\u31a6\u02ca"));
  it("\u786c ng\u0113", () => strictEqual(convert("ng\u0113", "tl", "zhuyin"), "\u312b\u31a4\u02eb"));
  it("\u7fa9 g\u012b", () => strictEqual(convert("g\u012b", "tl", "zhuyin"), "\u31a3\u3127\u02eb"));
  it("\u9d5d g\u00f4", () => strictEqual(convert("g\u00f4", "tl", "zhuyin"), "\u31a3\u311b\u02ca"));
  it("\u559c h\u00ed", () => strictEqual(convert("h\u00ed", "tl", "zhuyin"), "\u310f\u3127\u02cb"));
  it("\u82b1 hue", () => strictEqual(convert("hue", "tl", "zhuyin"), "\u310f\u3128\u31a4"));
  it("\u963f a", () => strictEqual(convert("a", "tl", "zhuyin"), "\u311a"));
  it("\u8a2d siat", () => strictEqual(convert("siat", "tl", "zhuyin"), "\u3112\u3127\u311a\u31b5"));
  it("\u555e \u00e9", () => strictEqual(convert("\u00e9", "tl", "zhuyin"), "\u31a4\u02cb"));
  it("\u6905 \u00ed", () => strictEqual(convert("\u00ed", "tl", "zhuyin"), "\u3127\u02cb"));
  it("\u8272 sik", () => strictEqual(convert("sik", "tl", "zhuyin"), "\u3112\u3127\u31bb"));
  it("\u798f hok", () => strictEqual(convert("hok", "tl", "zhuyin"), "\u310f\u31a6\u31bb"));
  it("\u597d h\u00f3", () => strictEqual(convert("h\u00f3", "tl", "zhuyin"), "\u310f\u311b\u02cb"));
  it("\u5bf6 p\u00f3", () => strictEqual(convert("p\u00f3", "tl", "zhuyin"), "\u3105\u311b\u02cb"));
  it("\u6b66 b\u00fa", () => strictEqual(convert("b\u00fa", "tl", "zhuyin"), "\u31a0\u3128\u02cb"));
  it("\u71e8 ut", () => strictEqual(convert("ut", "tl", "zhuyin"), "\u3128\u31b5"));
  it("\u5bb6 kee", () => strictEqual(convert("kee", "tl", "zhuyin"), "\u310d\u311d"));
  it("\u706b h\u00e9r", () => strictEqual(convert("h\u00e9r", "tl", "zhuyin"), "\u310f\u311c\u02cb"));
  it("or \u2192 \u311c", () => strictEqual(convert("or", "tl", "zhuyin"), "\u311c"));
  it("\u96de kere", () => strictEqual(convert("kere", "tl", "zhuyin"), "\u310d\u311c\u31a4"));
  it("\u8c6c tir", () => strictEqual(convert("tir", "tl", "zhuyin"), "\u3109\u31a8"));
  it("\u92c0 g\u00eern", () => strictEqual(convert("g\u00eern", "tl", "zhuyin"), "\u31a3\u31a8\u3123\u02ca"));
  it("\u611b \u00e0i", () => strictEqual(convert("\u00e0i", "tl", "zhuyin"), "\u311e\u02ea"));
  it("\u4e56 kuai", () => strictEqual(convert("kuai", "tl", "zhuyin"), "\u310d\u3128\u311e"));
  it("\u6b50 au", () => strictEqual(convert("au", "tl", "zhuyin"), "\u3120"));
  it("\u8df3 thi\u00e0u", () => strictEqual(convert("thi\u00e0u", "tl", "zhuyin"), "\u310a\u3127\u3120\u02ea"));
  it("\u886b sann", () => strictEqual(convert("sann", "tl", "zhuyin"), "\u3119\u31a9"));
  it("\u5c71 suann", () => strictEqual(convert("suann", "tl", "zhuyin"), "\u3119\u3128\u31a9"));
  it("\u5b30 enn", () => strictEqual(convert("enn", "tl", "zhuyin"), "\u31a5"));
  it("\u75c5 p\u0113nn", () => strictEqual(convert("p\u0113nn", "tl", "zhuyin"), "\u3105\u31a5\u02eb"));
  it("\u9662 \u012bnn", () => strictEqual(convert("\u012bnn", "tl", "zhuyin"), "\u31aa\u02eb"));
  it("\u597d h\u00f2nn", () => strictEqual(convert("h\u00f2nn", "tl", "zhuyin"), "\u310f\u31a7\u02ea"));
  it("\u5426 h\u00f3nn", () => strictEqual(convert("h\u00f3nn", "tl", "zhuyin"), "\u310f\u31a7\u02cb"));
  it("\u9d26 iunn", () => strictEqual(convert("iunn", "tl", "zhuyin"), "\u3127\u31ab"));
  it("\u5f35 tiunn", () => strictEqual(convert("tiunn", "tl", "zhuyin"), "\u3109\u3127\u31ab"));
  it("\u59c6 \u1e3f", () => strictEqual(convert("\u1e3f", "tl", "zhuyin"), "\u31ac\u02cb"));
  it("\u97f3 im", () => strictEqual(convert("im", "tl", "zhuyin"), "\u3127\u31ac"));
  it("\u9ec3 n\u0302g", () => strictEqual(convert("n\u0302g", "tl", "zhuyin"), "\u31ad\u02ca"));
  it("\u79e7 ng", () => strictEqual(convert("ng", "tl", "zhuyin"), "\u31ad"));
  it("\u9592 \u00e2inn", () => strictEqual(convert("\u00e2inn", "tl", "zhuyin"), "\u31ae\u02ca"));
  it("\u6b79 ph\u00e1inn", () => strictEqual(convert("ph\u00e1inn", "tl", "zhuyin"), "\u3106\u31ae\u02cb"));
  it("\u55d3 iaunn", () => strictEqual(convert("iaunn", "tl", "zhuyin"), "\u3127\u31af"));
  it("\u6697 \u00e0m", () => strictEqual(convert("\u00e0m", "tl", "zhuyin"), "\u31b0\u02ea"));
  it("\u7518 kam", () => strictEqual(convert("kam", "tl", "zhuyin"), "\u310d\u31b0"));
  it("\u9650 \u0101n", () => strictEqual(convert("\u0101n", "tl", "zhuyin"), "\u3122\u02eb"));
  it("\u7159 ian", () => strictEqual(convert("ian", "tl", "zhuyin"), "\u3127\u3122"));
  it("\u6e2f k\u00e1ng", () => strictEqual(convert("k\u00e1ng", "tl", "zhuyin"), "\u310d\u3124\u02cb"));
  it("\u9805 h\u0101ng", () => strictEqual(convert("h\u0101ng", "tl", "zhuyin"), "\u310f\u3124\u02eb"));
  it("\u53c3 som", () => strictEqual(convert("som", "tl", "zhuyin"), "\u3119\u31b1"));
  it("\u63a9 om", () => strictEqual(convert("om", "tl", "zhuyin"), "\u31b1"));
  it("\u738b \u00f4ng", () => strictEqual(convert("\u00f4ng", "tl", "zhuyin"), "\u31b2\u02ca"));
  it("\u52c7 i\u00f3ng", () => strictEqual(convert("i\u00f3ng", "tl", "zhuyin"), "\u3127\u31b2\u02cb"));
  it("\u56e0 in", () => strictEqual(convert("in", "tl", "zhuyin"), "\u3127\u3123"));
  it("\u6eab un", () => strictEqual(convert("un", "tl", "zhuyin"), "\u3128\u3123"));
  it("\u6069 irn", () => strictEqual(convert("irn", "tl", "zhuyin"), "\u31a8\u3123"));
  it("\u6c38 \u00edng", () => strictEqual(convert("\u00edng", "tl", "zhuyin"), "\u3127\u3125\u02cb"));
  it("\u5175 ping", () => strictEqual(convert("ping", "tl", "zhuyin"), "\u3105\u3127\u3125"));
  it("er\u011b tone 6", () => strictEqual(convert("er\u011b", "tl", "zhuyin"), "\u311c\u31a4\u02c7"));
  it("--ah neutral tone", () => strictEqual(convert("--ah", "tl", "zhuyin"), "\u00b7\u311a\u31b7"));
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
