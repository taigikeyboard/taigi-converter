from taigi_converter.tables import (
    PUNCTUATION_CHARS,
    PUNCTUATION_PAIRS,
    ZHUYIN_INITIALS,
    ZHUYIN_TONES_ENCODE_SAFE,
    ZHUYIN_TONES_STANDARD,
    ZHUYIN_VOWELS,
)


def to_zhuyin(text, *, encode_safe=False):
    remaining = text
    pre_punctuation = ""
    hongim_consonant = ""
    hongim_vowel = ""
    hongim_tone = ""

    while True:
        matched = False
        for punct in PUNCTUATION_CHARS:
            if remaining.startswith(punct):
                matched = True
                pre_punctuation += punct
                remaining = remaining[len(punct) :]
                break
        if not matched:
            break

    for tailo, tps in ZHUYIN_INITIALS:
        if remaining.startswith(tailo):
            hongim_consonant = tps
            remaining = remaining[len(tailo) :]
            break

    while True:
        matched = False
        for tailo, tps in ZHUYIN_VOWELS:
            if remaining.startswith(tailo):
                matched = True
                hongim_vowel += tps
                remaining = remaining[len(tailo) :]
                break
        if not matched:
            break

    tone_table = ZHUYIN_TONES_ENCODE_SAFE if encode_safe else ZHUYIN_TONES_STANDARD
    for tailo, tps in tone_table:
        if remaining.startswith(tailo):
            hongim_tone = tps
            remaining = remaining[len(tailo) :]
            break

    if hongim_vowel == "" and hongim_consonant == "\u3107":
        hongim_vowel = "\u31ac"

    if hongim_vowel == "\u3125" and hongim_consonant == "":
        hongim_vowel = "\u31ad"

    result = pre_punctuation + hongim_consonant + hongim_vowel + hongim_tone + remaining

    while True:
        matched = False
        for tps_punct, tailo_punct in PUNCTUATION_PAIRS:
            if tailo_punct in result:
                matched = True
                result = result.replace(tailo_punct, tps_punct)
                break
        if not matched:
            break

    return result
