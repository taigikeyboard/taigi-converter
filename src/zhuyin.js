import {
  PUNCTUATION_CHARS, PUNCTUATION_PAIRS,
  ZHUYIN_INITIALS, ZHUYIN_VOWELS, ZHUYIN_TONES, ZHUYIN_TONES_ENCODE_SAFE
} from "./tables.js";

export function toZhuyin(text, { encodeSafe = false } = {}) {
  let remaining = text;
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

  if (vowel === "" && consonant === "\u3107") vowel = "\u31ac";
  if (vowel === "\u3125" && consonant === "") vowel = "\u31ad";

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

  return result;
}
