from taigi_converter.zhuyin import to_zhuyin


class TestToZhuyin:
    def test_simple_syllable(self):
        assert to_zhuyin("pa1") == "ㄅㄚ "

    def test_aspirated(self):
        assert to_zhuyin("pha1") == "ㄆㄚ "

    def test_tone_2(self):
        assert to_zhuyin("ka2") == "ㄍㄚˋ"

    def test_tone_3(self):
        assert to_zhuyin("ka3") == "ㄍㄚ˪"

    def test_tone_5(self):
        assert to_zhuyin("ka5") == "ㄍㄚˊ"

    def test_tone_7(self):
        assert to_zhuyin("ka7") == "ㄍㄚ˫"

    def test_stop_tone_p4(self):
        assert to_zhuyin("kap4") == "ㄍㄚㆴ"

    def test_stop_tone_t4(self):
        assert to_zhuyin("kat4") == "ㄍㄚㆵ"

    def test_stop_tone_k4(self):
        assert to_zhuyin("kak4") == "ㄍㄚㆶ"

    def test_stop_tone_h4(self):
        assert to_zhuyin("kah4") == "ㄍㄚㆷ"

    def test_tone_p8_standard(self):
        assert to_zhuyin("kap8") == "ㄍㄚㆴ̇"

    def test_tone_p8_encode_safe(self):
        assert to_zhuyin("kap8", encode_safe=True) == "ㄍㄚㆴ˙"

    def test_standalone_m(self):
        assert to_zhuyin("m1") == "ㄇㆬ "

    def test_standalone_ng(self):
        assert to_zhuyin("ng1") == "ㄫ "

    def test_nasal_vowel(self):
        assert to_zhuyin("ann1") == "ㆩ "

    def test_multi_char_consonant_tshi(self):
        assert to_zhuyin("tshi1") == "ㄑㄧ "

    def test_punctuation_comma(self):
        result = to_zhuyin("ka1,")
        assert "，" in result

    def test_punctuation_period(self):
        result = to_zhuyin("ka1.")
        assert "。" in result
