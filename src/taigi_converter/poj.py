import re
import unicodedata

from taigi_converter.tables import POJ_FINAL_SUBS, POJ_INITIAL_FROM_TL, TONE_NUM_TO_COMBINING


def to_poj(initial, final, tone):
    poj_initial = POJ_INITIAL_FROM_TL.get(initial, initial)
    poj_final = _tl_final_to_poj(final)
    mark = _poj_tone_mark(tone)
    marked_final = _place_poj_tone_mark(poj_final, mark)
    return unicodedata.normalize("NFC", poj_initial + marked_final)


def _tl_final_to_poj(final):
    result = final
    for tl_part, poj_part in POJ_FINAL_SUBS:
        result = result.replace(tl_part, poj_part)
    return result


def _poj_tone_mark(tone):
    mark = TONE_NUM_TO_COMBINING.get(tone, "")
    if tone == "9":
        mark = "\u0306"
    return mark


def _place_poj_tone_mark(final, mark):
    if not mark:
        return final
    if "o\u0358" in final:
        return final.replace("o\u0358", "o" + mark + "\u0358", 1)
    if re.search(r"(iau)|(oai)", final):
        return final.replace("a", "a" + mark, 1)
    vowels_match = re.search(r"[aeiou]{2}", final)
    if vowels_match:
        start = vowels_match.start()
        first, second = final[start], final[start + 1]
        if first == "i":
            target = second
        elif second == "i":
            target = first
        elif len(final) == 2:
            target = first
        elif final[-1] == "\u207f" and final[-2:] != "h\u207f":
            target = first
        else:
            suffix = final[start + 2 :]
            if suffix and suffix[0] in "nmgptkh\u207f":
                target = second
            else:
                target = first
        return final.replace(target, target + mark, 1)
    single = re.search(r"[aeiou]", final)
    if single:
        target = single.group(0)
        pos = single.start()
        return final[:pos] + target + mark + final[pos + 1 :]
    if "ng" in final:
        return final.replace("n", "n" + mark, 1)
    if "m" in final:
        return final.replace("m", "m" + mark, 1)
    return final
