# taigi-converter

Bidirectional converter between Taigi (Taiwanese) phonetic systems: TL (Tai-lo), POJ (Pe-oh-e-ji), and Zhuyin (TPS/Bopomofo).

## Features

- Convert between TL, POJ, and Zhuyin
- Tone mark to tone number conversion (and vice versa)
- Handles mixed text with punctuation and hyphens
- Preserves letter casing

## CLI Usage

```bash
# Convert between romanization systems
taigi-converter convert -s tl -t poj "tshiu-a"
taigi-converter convert -s poj -t tl "chhiu-a"

# Convert to Zhuyin (TPS)
taigi-converter convert -s tl -t zhuyin "tshiu7 a2"

# Tone mark / tone number conversion
taigi-converter tone-number "Gau-tsa"
taigi-converter tone-mark "tshiu7-a2"

# File conversion
taigi-converter convert -s tl -t poj -i input.txt -o output.txt

# Legacy mode (Tailo numbered input to Zhuyin file conversion)
taigi-converter legacy -i input.txt -o output.txt [--safe]
```

## Library

```python
from taigi_converter import convert, to_tone_number, to_tone_mark

# Convert between systems
convert("tshiu-a", "tl", "poj")    # "chhiu-a"
convert("chhiu-a", "poj", "tl")    # "tshiu-a"
convert("tshiu7 a2", "tl", "zhuyin")  # Zhuyin output

# Tone conversion
to_tone_number("Gau-tsa")   # "Gau5-tsa2"
to_tone_mark("tshiu7-a2")      # "tshiu-a"
to_tone_mark("tshiu7-a2", system="poj")  # "chhiu-a"

# Legacy API (backward compatible)
from taigi_converter import TailoTpsConverter
converter = TailoTpsConverter()
converter.convert("tiau1 su5 pek8 te7")
```

## Development

```bash
uv run pytest              # run tests
uv run ruff check src/ tests/   # lint
uv run ruff format src/ tests/  # format
```
