import re
import unicodedata

from taigi_converter.phonetics import is_stop_tone, parse_syllable, strip_tone_mark
from taigi_converter.poj import to_poj
from taigi_converter.tables import nfc
from taigi_converter.tl import to_tl
from taigi_converter.zhuyin import to_zhuyin

_SYSTEMS = {"tl", "poj", "zhuyin"}

_SYLLABLE_RE = re.compile(
    r"([A-Za-z\u0300-\u030d\u030b\u0306\u0358\u207f"
    r"\u00e1\u00e0\u00e2\u00ea\u00e9\u00e8\u00f3\u00f2\u00f4\u00fa\u00f9\u00ec\u00ee"
    r"\u0101\u0113\u012b\u014d\u016b\u01ce\u011b\u030d"
    r"]+[0-9]?)"
)


def convert(text, source, target):
    if source not in _SYSTEMS:
        raise ValueError(f"Unknown source system: {source}")
    if target not in _SYSTEMS:
        raise ValueError(f"Unknown target system: {target}")

    if source == target:
        return text

    if source == "zhuyin":
        raise ValueError("Zhuyin as source is not yet supported")

    if target == "zhuyin":
        return _convert_to_zhuyin(text, source)

    return _convert_romanization(text, source, target)


def _convert_to_zhuyin(text, source):
    numbered = to_tone_number(text)
    lines = numbered.splitlines()
    result_lines = []
    for line in lines:
        tokens = line.split(" ")
        converted = "".join(to_zhuyin(t) for t in tokens)
        result_lines.append(converted)
    return "\n".join(result_lines)


def _convert_romanization(text, source, target):
    assembler = to_tl if target == "tl" else to_poj

    def replace_syllable(match):
        syllable = match.group(1)
        try:
            initial, final, tone = parse_syllable(syllable)
        except ValueError:
            return syllable
        case = _detect_case(syllable)
        result = assembler(initial, final, tone)
        return _apply_case(result, case)

    return _SYLLABLE_RE.sub(replace_syllable, text)


def to_tone_number(text):
    decomposed = unicodedata.normalize("NFD", text)
    result = []
    i = 0
    while i < len(decomposed):
        if decomposed[i].isalpha() or decomposed[i] in "\u0358\u207f":
            syllable_start = i
            while i < len(decomposed) and (
                decomposed[i].isalpha()
                or unicodedata.category(decomposed[i]).startswith("M")
                or decomposed[i] in "\u0358\u207f"
            ):
                i += 1
            if i < len(decomposed) and decomposed[i].isdigit():
                result.append(decomposed[syllable_start : i + 1])
                i += 1
                continue
            chunk = decomposed[syllable_start:i]
            bare, tone = strip_tone_mark(unicodedata.normalize("NFC", chunk))
            if tone:
                result.append(nfc(bare) + tone)
            else:
                bare_nfc = nfc(bare)
                try:
                    _, final, _ = parse_syllable(bare_nfc)
                    if is_stop_tone(final):
                        result.append(bare_nfc + "4")
                    else:
                        result.append(bare_nfc + "1")
                except ValueError:
                    result.append(bare_nfc)
        else:
            result.append(decomposed[i])
            i += 1
    return "".join(result)


def to_tone_mark(text, system="tl"):
    assembler = to_tl if system == "tl" else to_poj

    def replace_match(match):
        syllable = match.group(1)
        if not re.search(r"[0-9]$", syllable):
            return syllable
        try:
            initial, final, tone = parse_syllable(syllable)
        except ValueError:
            return syllable
        case = _detect_case(syllable)
        result = assembler(initial, final, tone)
        return _apply_case(result, case)

    return _SYLLABLE_RE.sub(replace_match, text)


def _detect_case(text):
    alpha = "".join(c for c in text if c.isalpha())
    if not alpha:
        return "lower"
    if alpha.isupper():
        return "upper"
    if alpha[0].isupper():
        return "title"
    return "lower"


def _apply_case(text, case):
    if case == "upper":
        return text.upper()
    if case == "title":
        return text[0].upper() + text[1:] if text else text
    return text


class TailoTpsConverter:
    def convert(self, text, *, encode_safe=False):
        lines = text.splitlines()
        result_lines = []
        for line in lines:
            tokens = line.split(" ")
            converted = "".join(to_zhuyin(t, encode_safe=encode_safe) for t in tokens)
            result_lines.append(converted)
        return "\n".join(result_lines)

    def convert_file(self, input_path, output_path, *, encode_safe=False):
        with open(input_path, encoding="utf-8") as f:
            text = f.read()
        result = self.convert(text, encode_safe=encode_safe)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result)
        return result
