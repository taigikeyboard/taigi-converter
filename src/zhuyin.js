import {
  PUNCTUATION_CHARS, PUNCTUATION_PAIRS,
  ZHUYIN_INITIALS, ZHUYIN_VOWELS, ZHUYIN_TONES, ZHUYIN_TONES_ENCODE_SAFE
} from "./tables.js";

function buildReverse(pairs) {
  const rev = pairs.map(([tl, tps]) => [tps, tl]);
  rev.sort((a, b) => b[0].length - a[0].length);
  return rev;
}

function buildReverseTones() {
  const map = new Map();
  for (const table of [ZHUYIN_TONES, ZHUYIN_TONES_ENCODE_SAFE]) {
    for (const [tl, tps] of table) {
      if (!map.has(tps)) map.set(tps, tl);
    }
  }
  const entries = [...map.entries()];
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
}

const REV_INITIALS = buildReverse(ZHUYIN_INITIALS);
REV_INITIALS.push(["\u3110", "ts"], ["\u3111", "tsh"], ["\u3112", "s"], ["\u31a2", "j"]);
REV_INITIALS.sort((a, b) => b[0].length - a[0].length);
const REV_VOWELS = buildReverse(ZHUYIN_VOWELS);
REV_VOWELS.push(["\u3125", "ng"]);
REV_VOWELS.sort((a, b) => b[0].length - a[0].length);
const REV_TONES = buildReverseTones();

const REV_PUNCT = new Map(PUNCTUATION_PAIRS.map(([tps, ascii]) => [tps, ascii.trim()]));

const ZHUYIN_RE = /[\u3100-\u312F\u31A0-\u31BF]/;

export function isZhuyin(text) {
  return ZHUYIN_RE.test(text);
}

export function fromZhuyin(text) {
  let remaining = text;
  const parts = [];
  let initial = "";
  let vowel = "";
  let neutralMark = null;

  const flushSyllable = (tone = "") => {
    if (!initial && !vowel) return;
    let syl = initial === "m" && vowel === "m" ? "m" : initial + vowel;
    if (syl.includes("oo") && /^[ptk][48]$/.test(tone)) syl = syl.replace("oo", "o");
    parts.push({ type: "syllable", value: syl + tone, neutral: neutralMark !== null });
    neutralMark = null;
    initial = "";
    vowel = "";
  };
  const dropNeutralMark = () => {
    if (neutralMark === "\u00b7") parts.push({ type: "other", value: neutralMark });
    neutralMark = null;
  };

  while (remaining.length > 0) {
    let matched = false;

    if (remaining[0] === "\u00b7" || (remaining[0] === "\u02d9" && !initial && !vowel)) {
      flushSyllable();
      dropNeutralMark();
      neutralMark = remaining[0];
      remaining = remaining.slice(1);
      continue;
    }

    for (const [tps, tl] of REV_TONES) {
      if (remaining.startsWith(tps)) {
        remaining = remaining.slice(tps.length);
        flushSyllable(tl);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    if (initial === "" && vowel === "") {
      for (const [tps, tl] of REV_INITIALS) {
        if (remaining.startsWith(tps)) {
          initial = tl;
          remaining = remaining.slice(tps.length);
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    for (const [tps, tl] of REV_VOWELS) {
      if (remaining.startsWith(tps)) {
        vowel += tl;
        remaining = remaining.slice(tps.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    flushSyllable();
    dropNeutralMark();
    parts.push({ type: "other", value: REV_PUNCT.get(remaining[0]) ?? remaining[0] });
    remaining = remaining.slice(1);
  }

  flushSyllable();
  dropNeutralMark();

  let result = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const previous = parts[i - 1];
    if (part.type === "syllable" && part.neutral) {
      result += "--";
    } else if (part.type === "syllable" && previous?.type === "syllable") {
      result += previous.neutral ? " " : "-";
    }
    result += part.value;
  }
  return result;
}

export function toZhuyin(text, { encodeSafe = false } = {}) {
  let remaining = text.toLowerCase();
  let prePunctuation = "";
  let consonant = "";
  let vowel = "";
  let hongimTone = "";

  while (true) {
    let matched = false;
    for (const punct of PUNCTUATION_CHARS) {
      if (remaining.startsWith(punct)) {
        prePunctuation += punct;
        remaining = remaining.slice(punct.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  for (const [tailo, tps] of ZHUYIN_INITIALS) {
    if (remaining.startsWith(tailo)) {
      if (tailo.endsWith("i") && remaining[tailo.length] === "r") {
        continue;
      }
      consonant = tps;
      remaining = remaining.slice(tailo.length);
      break;
    }
  }

  while (true) {
    let matched = false;
    for (const [tailo, tps] of ZHUYIN_VOWELS) {
      if (remaining.startsWith(tailo)) {
        vowel += tps;
        remaining = remaining.slice(tailo.length);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  const toneTable = encodeSafe ? ZHUYIN_TONES_ENCODE_SAFE : ZHUYIN_TONES;
  for (const [tailo, tps] of toneTable) {
    if (remaining.startsWith(tailo)) {
      hongimTone = tps;
      remaining = remaining.slice(tailo.length);
      break;
    }
  }

  if (vowel === "" && consonant === "\u3107") { vowel = "\u31ac"; consonant = ""; }
  if (vowel === "" && consonant === "\u312b") { vowel = "\u31ad"; consonant = ""; }
  if (vowel === "\u3125" && consonant === "") vowel = "\u31ad";
  if ((consonant + vowel).endsWith("\u31ad") && (consonant + vowel).slice(-2, -1) === "\u3127") {
    vowel = vowel.replace("\u31ad", "\u3125");
  }
  if (consonant.endsWith("\u3127") && vowel === "\u3123\u3123") {
    consonant = consonant.slice(0, -1);
    vowel = "\u31aa";
  }
  if (vowel.includes("\u311b") && hongimTone.length > 0 && "\u31b4\u31b5\u31bb".includes(hongimTone[0])) {
    vowel = vowel.replaceAll("\u311b", "\u31a6");
  }

  let result = prePunctuation + consonant + vowel + hongimTone + remaining;

  while (true) {
    let matched = false;
    for (const [tpsPunct, tailoPunct] of PUNCTUATION_PAIRS) {
      if (result.includes(tailoPunct)) {
        result = result.replaceAll(tailoPunct, tpsPunct);
        matched = true;
        break;
      }
    }
    if (!matched) break;
  }

  result = result.replaceAll("--", "\u02d9");

  return result;
}
