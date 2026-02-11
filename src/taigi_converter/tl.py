import unicodedata

from taigi_converter.tables import TONE_NUM_TO_COMBINING


def to_tl(initial, final, tone):
    mark = _tl_tone_mark(tone)
    marked_final = _place_tl_tone_mark(final, mark)
    return unicodedata.normalize("NFC", initial + marked_final)


def _tl_tone_mark(tone):
    mark = TONE_NUM_TO_COMBINING.get(tone, "")
    if tone == "9":
        mark = "\u030b"
    return mark


def _place_tl_tone_mark(final, mark):
    if not mark:
        return final
    if "a" in final:
        return final.replace("a", "a" + mark, 1)
    if "oo" in final:
        return final.replace("oo", "o" + mark + "o", 1)
    if "ere" in final:
        return final.replace("ere", "ere" + mark, 1)
    if "e" in final:
        return final.replace("e", "e" + mark, 1)
    if "o" in final:
        return final.replace("o", "o" + mark, 1)
    if "ui" in final:
        return final.replace("i", "i" + mark, 1)
    if "iu" in final:
        return final.replace("u", "u" + mark, 1)
    if "iri" in final:
        return final.replace("iri", "iri" + mark, 1)
    if "i" in final:
        return final.replace("i", "i" + mark, 1)
    if "u" in final:
        return final.replace("u", "u" + mark, 1)
    if "ng" in final:
        return final.replace("ng", "n" + mark + "g", 1)
    if "m" in final:
        return final.replace("m", "m" + mark, 1)
    return final
