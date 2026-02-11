import re
import unicodedata

from taigi_converter.tables import (
    COMBINING_TO_TONE_NUM,
    TL_FINALS,
    TL_INITIALS,
)

_COMBINING_PATTERN = re.compile("[\u0301\u0300\u0302\u030c\u0304\u030d\u030b\u0306]")


def parse_syllable(text):
    bare, tone = strip_tone_mark(text)
    normalized = _normalize_to_tl(bare.lower())
    initial, final = _split_initial_final(normalized)
    if not tone:
        tone = "4" if is_stop_tone(final) else "1"
    return initial, final, tone


def strip_tone_mark(text):
    decomposed = unicodedata.normalize("NFD", text)
    match = _COMBINING_PATTERN.search(decomposed)
    if not match:
        num_match = re.search(r"[1-9]$", decomposed)
        if num_match:
            tone_num = num_match.group(0)
            bare = decomposed[: num_match.start()]
            return unicodedata.normalize("NFC", bare), tone_num
        return unicodedata.normalize("NFC", text), ""
    mark = match.group(0)
    bare = decomposed.replace(mark, "", 1)
    if mark == "\u030b":
        tone_num = "9"
    else:
        tone_num = COMBINING_TO_TONE_NUM.get(mark, "")
    return unicodedata.normalize("NFC", bare), tone_num


def is_stop_tone(final):
    cleaned = final.lower().replace("nn", "")
    return cleaned.endswith(("p", "t", "k", "h"))


def _normalize_to_tl(text):
    text = (
        text.replace("ch", "ts")
        .replace("ou", "oo")
        .replace("o\u0358", "oo")
        .replace("\u207f", "nn")
        .replace("oa", "ua")
        .replace("oe", "ue")
        .replace("eng", "ing")
        .replace("ek", "ik")
        .replace("oonn", "onn")
    )
    return text


def _split_initial_final(text):
    for i in range(len(text)):
        initial = text[:i]
        if initial in TL_INITIALS:
            final = text[i:]
            if final in TL_FINALS:
                return initial, final
    raise ValueError(f"Cannot parse syllable: {text}")
