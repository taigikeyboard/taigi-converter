from taigi_converter.tl import to_tl


class TestToTl:
    def test_simple_tone_2(self):
        assert to_tl("k", "a", "2") == "ká"

    def test_tone_1_no_mark(self):
        assert to_tl("k", "a", "1") == "ka"

    def test_tone_4_no_mark(self):
        assert to_tl("k", "ah", "4") == "kah"

    def test_tone_5_circumflex(self):
        assert to_tl("k", "a", "5") == "kâ"

    def test_tone_7_macron(self):
        assert to_tl("k", "a", "7") == "kā"

    def test_tone_8_vertical(self):
        assert to_tl("k", "ah", "8") == "ka̍h"

    def test_tone_on_a_priority(self):
        assert to_tl("k", "ai", "2") == "kái"

    def test_tone_on_oo(self):
        result = to_tl("k", "oo", "5")
        assert result == "kôo"

    def test_tone_on_e(self):
        assert to_tl("t", "e", "7") == "tē"

    def test_tone_on_o(self):
        assert to_tl("k", "o", "2") == "kó"

    def test_ui_tone_on_i(self):
        assert to_tl("k", "ui", "3") == "kuì"

    def test_iu_tone_on_u(self):
        assert to_tl("tsh", "iu", "7") == "tshiū"

    def test_ng_tone_on_n(self):
        result = to_tl("", "ng", "5")
        assert result == "n\u0302g"

    def test_m_tone(self):
        result = to_tl("", "m", "7")
        assert result == "m\u0304"

    def test_no_initial(self):
        assert to_tl("", "a", "2") == "á"

    def test_complex_final(self):
        assert to_tl("k", "iang", "5") == "kiâng"

    def test_tone_9(self):
        result = to_tl("k", "a", "9")
        assert result == "ka\u030b"
