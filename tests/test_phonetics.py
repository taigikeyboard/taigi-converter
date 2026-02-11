import pytest

from taigi_converter.phonetics import is_stop_tone, parse_syllable, strip_tone_mark


class TestStripToneMark:
    def test_acute_accent_tone_2(self):
        bare, tone = strip_tone_mark("á")
        assert bare == "a"
        assert tone == "2"

    def test_grave_accent_tone_3(self):
        bare, tone = strip_tone_mark("à")
        assert bare == "a"
        assert tone == "3"

    def test_circumflex_tone_5(self):
        bare, tone = strip_tone_mark("â")
        assert bare == "a"
        assert tone == "5"

    def test_macron_tone_7(self):
        bare, tone = strip_tone_mark("ā")
        assert bare == "a"
        assert tone == "7"

    def test_vertical_line_tone_8(self):
        bare, tone = strip_tone_mark("a̍")
        assert bare == "a"
        assert tone == "8"

    def test_no_tone_mark(self):
        bare, tone = strip_tone_mark("a")
        assert bare == "a"
        assert tone == ""

    def test_tone_number_suffix(self):
        bare, tone = strip_tone_mark("ka2")
        assert bare == "ka"
        assert tone == "2"

    def test_multi_char_syllable(self):
        bare, tone = strip_tone_mark("tshiū")
        assert bare == "tshiu"
        assert tone == "7"


class TestIsStopTone:
    def test_p_ending(self):
        assert is_stop_tone("ap") is True

    def test_t_ending(self):
        assert is_stop_tone("at") is True

    def test_k_ending(self):
        assert is_stop_tone("ak") is True

    def test_h_ending(self):
        assert is_stop_tone("ah") is True

    def test_non_stop(self):
        assert is_stop_tone("a") is False
        assert is_stop_tone("an") is False
        assert is_stop_tone("ang") is False

    def test_nasal_with_h(self):
        assert is_stop_tone("annh") is True


class TestParseSyllable:
    def test_simple_syllable(self):
        initial, final, tone = parse_syllable("ka2")
        assert initial == "k"
        assert final == "a"
        assert tone == "2"

    def test_tone_marked_syllable(self):
        initial, final, tone = parse_syllable("ká")
        assert initial == "k"
        assert final == "a"
        assert tone == "2"

    def test_no_initial(self):
        initial, final, tone = parse_syllable("a1")
        assert initial == ""
        assert final == "a"
        assert tone == "1"

    def test_complex_final(self):
        initial, final, tone = parse_syllable("kang1")
        assert initial == "k"
        assert final == "ang"
        assert tone == "1"

    def test_stop_tone_inferred(self):
        initial, final, tone = parse_syllable("kah")
        assert initial == "k"
        assert final == "ah"
        assert tone == "4"

    def test_tone_1_inferred(self):
        initial, final, tone = parse_syllable("ka")
        assert initial == "k"
        assert final == "a"
        assert tone == "1"

    def test_aspirated_initial(self):
        initial, final, tone = parse_syllable("pha3")
        assert initial == "ph"
        assert final == "a"
        assert tone == "3"

    def test_tsh_initial(self):
        initial, final, tone = parse_syllable("tshiu7")
        assert initial == "tsh"
        assert final == "iu"
        assert tone == "7"

    def test_poj_ch_converts_to_ts(self):
        initial, final, tone = parse_syllable("chhi2")
        assert initial == "tsh"
        assert final == "i"
        assert tone == "2"

    def test_poj_oa_converts_to_ua(self):
        initial, final, tone = parse_syllable("koa1")
        assert initial == "k"
        assert final == "ua"
        assert tone == "1"

    def test_poj_oe_converts_to_ue(self):
        initial, final, tone = parse_syllable("koe1")
        assert initial == "k"
        assert final == "ue"
        assert tone == "1"

    def test_poj_eng_converts_to_ing(self):
        initial, final, tone = parse_syllable("peng5")
        assert initial == "p"
        assert final == "ing"
        assert tone == "5"

    def test_ng_syllable(self):
        initial, final, tone = parse_syllable("ng5")
        assert initial == ""
        assert final == "ng"
        assert tone == "5"

    def test_m_syllable(self):
        initial, final, tone = parse_syllable("m7")
        assert initial == ""
        assert final == "m"
        assert tone == "7"

    def test_invalid_syllable(self):
        with pytest.raises(ValueError):
            parse_syllable("xyz")
