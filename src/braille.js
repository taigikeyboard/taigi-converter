import {
  BRAILLE_INITIALS, BRAILLE_FINALS, BRAILLE_TONES,
  BRAILLE_NASAL, BRAILLE_KHIN, BRAILLE_PUNCTUATION
} from "./tables.js";
import { parseSyllable } from "./phonetics.js";
import { toTl } from "./tl.js";

const TOKEN_RE = /[\p{Script=Latin}\p{M}ⁿᴺ]+[0-9]?|--|./gsu;

export function syllableToBraille(initial, final, tone) {
  const initialCell = BRAILLE_INITIALS.get(initial);
  const toneCell = BRAILLE_TONES.get(tone);
  let base = final;
  let nasal = false;
  if (base.endsWith("nnh")) {
    nasal = true;
    base = base.slice(0, -3);
  } else if (base.endsWith("nn")) {
    nasal = true;
    base = base.slice(0, -2);
  } else if (base.endsWith("h")) {
    base = base.slice(0, -1);
  } else if (base.endsWith("p")) {
    base = base.slice(0, -1) + "m";
  } else if (base.endsWith("t")) {
    base = base.slice(0, -1) + "n";
  } else if (base.endsWith("k")) {
    base = base.slice(0, -1) + "ng";
  }
  const finalCell = BRAILLE_FINALS.get(base);
  if (initialCell === undefined || finalCell === undefined || toneCell === undefined) {
    return null;
  }
  return (nasal ? BRAILLE_NASAL : "") + initialCell + finalCell + toneCell;
}

function encodeToken(token) {
  try {
    const [initial, final, tone] = parseSyllable(token);
    const cells = syllableToBraille(initial, final, tone);
    if (cells !== null) return cells;
    return toTl(initial, final, tone);
  } catch {
    return token;
  }
}

export function toBraille(text) {
  let result = "";
  let quoteOpen = false;
  for (const match of text.matchAll(TOKEN_RE)) {
    const token = match[0];
    if (token === "--") {
      result += BRAILLE_KHIN;
      continue;
    }
    if (token === "-") continue;
    if (/^[\p{Script=Latin}ⁿᴺ]/u.test(token)) {
      result += encodeToken(token);
      continue;
    }
    if (token === '"') {
      result += quoteOpen ? "⠴⠀" : "⠦";
      quoteOpen = !quoteOpen;
      continue;
    }
    const punct = BRAILLE_PUNCTUATION.get(token);
    result += punct !== undefined ? punct : token;
  }
  return result;
}
