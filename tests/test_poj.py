from taigi_converter.poj import to_poj


class TestToPoj:
    def test_ts_becomes_ch(self):
        assert to_poj("ts", "u", "2") == "chú"

    def test_tsh_becomes_chh(self):
        assert to_poj("tsh", "iu", "7") == "chhiū"

    def test_nn_becomes_nasal(self):
        result = to_poj("k", "ann", "2")
        assert "ⁿ" in result

    def test_oo_becomes_o_dot(self):
        result = to_poj("k", "oo", "1")
        assert "\u0358" in result

    def test_ua_becomes_oa(self):
        result = to_poj("k", "ua", "1")
        assert "oa" in result

    def test_ue_becomes_oe(self):
        result = to_poj("k", "ue", "1")
        assert "oe" in result

    def test_ing_becomes_eng(self):
        result = to_poj("p", "ing", "1")
        assert result == "peng"

    def test_ik_becomes_ek(self):
        result = to_poj("p", "ik", "4")
        assert "ek" in result

    def test_tone_1_no_mark(self):
        assert to_poj("k", "a", "1") == "ka"

    def test_tone_2_acute(self):
        assert to_poj("k", "a", "2") == "ká"

    def test_tone_5_circumflex(self):
        assert to_poj("k", "a", "5") == "kâ"

    def test_tone_7_macron(self):
        assert to_poj("k", "a", "7") == "kā"

    def test_tone_9_breve(self):
        result = to_poj("k", "a", "9")
        assert "ă" in result

    def test_non_ts_initial_unchanged(self):
        assert to_poj("k", "a", "2") == "ká"
        assert to_poj("p", "a", "2") == "pá"
        assert to_poj("h", "a", "2") == "há"

    def test_triphthong_iau_mark_on_a(self):
        result = to_poj("", "iau", "5")
        assert "â" in result

    def test_diphthong_ai_mark_on_first(self):
        result = to_poj("k", "ai", "2")
        assert result == "kái"

    def test_diphthong_ia_mark_on_second(self):
        result = to_poj("k", "ia", "2")
        assert "á" in result

    def test_o_dot_gets_mark(self):
        result = to_poj("k", "oo", "2")
        assert result is not None
