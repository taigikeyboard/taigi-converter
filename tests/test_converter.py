import pytest

from taigi_converter import TailoTpsConverter, convert, to_tone_mark, to_tone_number


@pytest.fixture
def converter():
    return TailoTpsConverter()


class TestConsonants:
    def test_basic_consonant(self, converter):
        assert converter.convert("pa1") == "ㄅㄚ "

    def test_aspirated_consonant(self, converter):
        assert converter.convert("pha1") == "ㄆㄚ "

    def test_multi_char_consonant_tshi(self, converter):
        assert converter.convert("tshi1") == "ㄑㄧ "

    def test_multi_char_consonant_tsi(self, converter):
        assert converter.convert("tsi1") == "ㄐㄧ "

    def test_ng_consonant(self, converter):
        assert converter.convert("nga1") == "ㄫㄚ "


class TestVowels:
    def test_single_vowel(self, converter):
        assert converter.convert("a1") == "ㄚ "

    def test_nasal_vowel(self, converter):
        assert converter.convert("ann1") == "ㆩ "

    def test_compound_vowel(self, converter):
        assert converter.convert("ai1") == "ㄞ "

    def test_double_vowel_oo(self, converter):
        assert converter.convert("oo1") == "ㆦ "


class TestTones:
    def test_tone_1(self, converter):
        assert converter.convert("ka1") == "ㄍㄚ "

    def test_tone_2(self, converter):
        assert converter.convert("ka2") == "ㄍㄚˋ"

    def test_tone_3(self, converter):
        assert converter.convert("ka3") == "ㄍㄚ˪"

    def test_tone_5(self, converter):
        assert converter.convert("ka5") == "ㄍㄚˊ"

    def test_tone_7(self, converter):
        assert converter.convert("ka7") == "ㄍㄚ˫"

    def test_tone_p4(self, converter):
        assert converter.convert("kap4") == "ㄍㄚㆴ"

    def test_tone_t4(self, converter):
        assert converter.convert("kat4") == "ㄍㄚㆵ"

    def test_tone_k4(self, converter):
        assert converter.convert("kak4") == "ㄍㄚㆶ"

    def test_tone_h4(self, converter):
        assert converter.convert("kah4") == "ㄍㄚㆷ"

    def test_tone_p8_standard(self, converter):
        assert converter.convert("kap8") == "ㄍㄚㆴ̇"

    def test_tone_p8_encode_safe(self, converter):
        assert converter.convert("kap8", encode_safe=True) == "ㄍㄚㆴ˙"


class TestSpecialCases:
    def test_standalone_m(self, converter):
        assert converter.convert("m1") == "ㄇㆬ "

    def test_standalone_ng(self, converter):
        assert converter.convert("ng1") == "ㄫ "

    def test_ng_with_consonant(self, converter):
        assert converter.convert("kang1") == "ㄍㄤ "


class TestPunctuation:
    def test_comma(self, converter):
        result = converter.convert("ka1,")
        assert "，" in result

    def test_period(self, converter):
        result = converter.convert("ka1.")
        assert "。" in result

    def test_question_mark(self, converter):
        result = converter.convert("ka1?")
        assert "？" in result


class TestMultiSyllable:
    def test_two_syllables(self, converter):
        result = converter.convert("su5 pek8")
        assert result == "ㄙㄨˊㄅㆤㆶ̇"

    def test_reference_example(self, converter):
        text = "tiau1 su5 pek8 te7 tshai2 un5 kan1,"
        result = converter.convert(text)
        assert result == "ㄉㄧㄠ ㄙㄨˊㄅㆤㆶ̇ㄉㆤ˫ㄘㄞˋㄨㄣˊㄍㄢ ，"


class TestMultiline:
    def test_multiline_input(self, converter):
        text = "ka1\nsu5"
        result = converter.convert(text)
        assert result == "ㄍㄚ \nㄙㄨˊ"


class TestFileConversion:
    def test_convert_file(self, converter, tmp_path):
        input_file = tmp_path / "input.txt"
        output_file = tmp_path / "output.txt"
        input_file.write_text("tiau1 su5", encoding="utf-8")

        result = converter.convert_file(str(input_file), str(output_file))

        assert result == "ㄉㄧㄠ ㄙㄨˊ"
        assert output_file.read_text(encoding="utf-8") == "ㄉㄧㄠ ㄙㄨˊ"


class TestConvertApi:
    def test_tl_to_poj_basic(self):
        result = convert("tshiū-á", "tl", "poj")
        assert "chh" in result

    def test_poj_to_tl_basic(self):
        result = convert("chhiū-á", "poj", "tl")
        assert "tsh" in result

    def test_tl_to_zhuyin(self):
        result = convert("tshiu7 a2", "tl", "zhuyin")
        assert "ㄑㄧㄨ˫" in result

    def test_same_system_passthrough(self):
        assert convert("hello", "tl", "tl") == "hello"

    def test_unknown_source(self):
        with pytest.raises(ValueError):
            convert("hello", "xyz", "tl")

    def test_unknown_target(self):
        with pytest.raises(ValueError):
            convert("hello", "tl", "xyz")

    def test_zhuyin_source_not_supported(self):
        with pytest.raises(ValueError):
            convert("ㄍㄚ", "zhuyin", "tl")

    def test_tl_to_poj_ing_to_eng(self):
        result = convert("pîng", "tl", "poj")
        assert "êng" in result

    def test_preserves_non_syllable_text(self):
        result = convert("hello-world", "tl", "poj")
        assert "-" in result

    def test_preserves_case_title(self):
        result = convert("Tâi-gí", "tl", "poj")
        assert result[0].isupper()


class TestToToneNumber:
    def test_basic(self):
        assert to_tone_number("ká") == "ka2"

    def test_tone_5(self):
        assert to_tone_number("kâ") == "ka5"

    def test_tone_7(self):
        assert to_tone_number("kā") == "ka7"

    def test_tone_8(self):
        assert to_tone_number("ka̍h") == "kah8"

    def test_already_numbered(self):
        assert to_tone_number("ka2") == "ka2"

    def test_multi_syllable(self):
        result = to_tone_number("Gâu-tsá")
        assert "5" in result
        assert "2" in result

    def test_no_tone(self):
        result = to_tone_number("ka")
        assert result == "ka1"

    def test_stop_tone_no_mark(self):
        result = to_tone_number("kah")
        assert result == "kah4"


class TestToToneMark:
    def test_basic_tl(self):
        result = to_tone_mark("ka2")
        assert result == "ká"

    def test_tone_5(self):
        result = to_tone_mark("ka5")
        assert result == "kâ"

    def test_tone_7(self):
        result = to_tone_mark("ka7")
        assert result == "kā"

    def test_tone_1_no_mark(self):
        result = to_tone_mark("ka1")
        assert result == "ka"

    def test_poj_system(self):
        result = to_tone_mark("tshiu7", system="poj")
        assert "chh" in result

    def test_multi_syllable_hyphenated(self):
        result = to_tone_mark("tshiu7-a2")
        assert "ū" in result
        assert "á" in result
