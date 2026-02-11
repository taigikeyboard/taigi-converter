import { isStopTone, normalizeToTl, parseSyllable, splitInitialFinal, stripToneMark } from "./phonetics.js";
import { toTl } from "./tl.js";
import { toPoj } from "./poj.js";
import { toZhuyin } from "./zhuyin.js";

const SYSTEMS = new Set(["tl", "poj", "zhuyin"]);

const SYLLABLE_RE = new RegExp(
  "([A-Za-z\\u0300-\\u030d\\u030b\\u0306\\u0358\\u207f" +
  "\\u00e1\\u00e0\\u00e2\\u00ea\\u00e9\\u00e8\\u00f3\\u00f2\\u00f4\\u00fa\\u00f9\\u00ec\\u00ee" +
  "\\u0101\\u0113\\u012b\\u014d\\u016b\\u01ce\\u011b\\u030d" +
  "]+[0-9]?)", "g"
);

export function convert(text, source, target) {
  if (!SYSTEMS.has(source)) throw new Error(`Unknown source system: ${source}`);
  if (!SYSTEMS.has(target)) throw new Error(`Unknown target system: ${target}`);
  if (source === target) return text;
  if (source === "zhuyin") throw new Error("Zhuyin as source is not yet supported");

  if (target === "zhuyin") {
    const numbered = toToneNumber(text);
    return numbered.split("\n").map(line => {
      return line.split(" ").map(word => {
        return word.split("-").map(t => toZhuyin(t)).join("");
      }).join("");
    }).join("\n");
  }

  const assembler = target === "tl" ? toTl : toPoj;
  return text.replace(SYLLABLE_RE, (match) => {
    try {
      const [initial, final, tone] = parseSyllable(match);
      const caseType = detectCase(match);
      const result = assembler(initial, final, tone);
      return applyCase(result, caseType);
    } catch {
      return match;
    }
  });
}

export function toToneNumber(text) {
  const decomposed = text.normalize("NFD");
  const result = [];
  let i = 0;
  while (i < decomposed.length) {
    const ch = decomposed[i];
    if (/\p{L}/u.test(ch) || ch === "\u0358" || ch === "\u207f") {
      const syllableStart = i;
      while (i < decomposed.length && (
        /\p{L}/u.test(decomposed[i]) ||
        /^\p{M}/u.test(decomposed[i]) ||
        decomposed[i] === "\u0358" || decomposed[i] === "\u207f"
      )) { i++; }
      if (i < decomposed.length && /[0-9]/.test(decomposed[i])) {
        result.push(decomposed.slice(syllableStart, i + 1));
        i++;
        continue;
      }
      const chunk = decomposed.slice(syllableStart, i);
      const nfcChunk = chunk.normalize("NFC");
      const [bare, tone] = stripToneMark(nfcChunk);
      if (tone) {
        result.push(bare.normalize("NFC") + tone);
      } else {
        const bareNfc = bare.normalize("NFC");
        try {
          const [, final] = splitInitialFinal(normalizeToTl(bareNfc.toLowerCase()));
          result.push(bareNfc + (isStopTone(final) ? "4" : "1"));
        } catch {
          result.push(bareNfc);
        }
      }
    } else {
      result.push(decomposed[i]);
      i++;
    }
  }
  return result.join("");
}

export function toToneMark(text, system = "tl") {
  const assembler = system === "tl" ? toTl : toPoj;
  return text.replace(SYLLABLE_RE, (match) => {
    if (!/[0-9]$/.test(match)) return match;
    try {
      const [initial, final, tone] = parseSyllable(match);
      const caseType = detectCase(match);
      const result = assembler(initial, final, tone);
      return applyCase(result, caseType);
    } catch {
      return match;
    }
  });
}

function detectCase(text) {
  const alpha = [...text].filter(c => /\p{L}/u.test(c)).join("");
  if (!alpha) return "lower";
  if (alpha === alpha.toUpperCase()) return "upper";
  if (alpha[0] === alpha[0].toUpperCase()) return "title";
  return "lower";
}

function applyCase(text, caseType) {
  if (caseType === "upper") return text.toUpperCase();
  if (caseType === "title") return text ? text[0].toUpperCase() + text.slice(1) : text;
  return text;
}
