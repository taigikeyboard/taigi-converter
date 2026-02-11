import { POJ_FINAL_SUBS, POJ_INITIAL_FROM_TL, TONE_NUM_TO_COMBINING } from "./tables.js";

export function toPoj(initial, final, tone) {
  const pojInitial = POJ_INITIAL_FROM_TL[initial] || initial;
  const pojFinal = tlFinalToPoj(final);
  let mark = TONE_NUM_TO_COMBINING[tone] || "";
  if (tone === "9") mark = "\u0306";
  const markedFinal = placePojToneMark(pojFinal, mark);
  return (pojInitial + markedFinal).normalize("NFC");
}

function tlFinalToPoj(final) {
  let result = final;
  for (const [tlPart, pojPart] of POJ_FINAL_SUBS) {
    result = result.replaceAll(tlPart, pojPart);
  }
  return result;
}

function placePojToneMark(final, mark) {
  if (!mark) return final;
  if (final.includes("o\u0358")) {
    return final.replace("o\u0358", "o" + mark + "\u0358");
  }
  if (/iau|oai/.test(final)) {
    return final.replace("a", "a" + mark);
  }
  const vowelsMatch = final.match(/[aeiou]{2}/);
  if (vowelsMatch) {
    const start = vowelsMatch.index;
    const first = final[start];
    const second = final[start + 1];
    let target;
    if (first === "i") {
      target = second;
    } else if (second === "i") {
      target = first;
    } else if (final.length === 2) {
      target = first;
    } else if (final.endsWith("\u207f") && !final.endsWith("h\u207f")) {
      target = first;
    } else {
      const suffix = final.slice(start + 2);
      if (suffix && "nmgptkh\u207f".includes(suffix[0])) {
        target = second;
      } else {
        target = first;
      }
    }
    return final.replace(target, target + mark);
  }
  const single = final.match(/[aeiou]/);
  if (single) {
    const pos = single.index;
    return final.slice(0, pos) + final[pos] + mark + final.slice(pos + 1);
  }
  if (final.includes("ng")) return final.replace("n", "n" + mark);
  if (final.includes("m")) return final.replace("m", "m" + mark);
  return final;
}
