# taigi-converter

## Overview

- Bidirectional converter between Taigi phonetic systems: TL, POJ, and Zhuyin (TPS)
- Supports tone mark / tone number conversion
- Ported and extended from [Tailo-TPS-Converter](references/Tailo-TPS-Converter) and [KeSi](references/KeSi)

## Project Structure

- `src/taigi_converter/` - main package
  - `tables.py` - all mapping data (initials, finals, tones, TL/POJ/Zhuyin maps)
  - `phonetics.py` - syllable parsing (`parse_syllable`, `strip_tone_mark`, `is_stop_tone`)
  - `tl.py` - TL (Tai-lo) assembly with tone mark placement
  - `poj.py` - POJ (Pe-oh-e-ji) assembly with tone mark placement
  - `zhuyin.py` - Zhuyin/TPS conversion (tone-numbered TL input)
  - `converter.py` - public API (`convert`, `to_tone_number`, `to_tone_mark`, `TailoTpsConverter`)
  - `cli.py` - CLI entry point (`taigi-converter` command)
- `tests/` - pytest test suite
- `references/` - original reference implementations (gitignored)

## Development

- **Python**: 3.13+
- **Package manager**: uv
- **Test framework**: pytest
- **Linter/formatter**: ruff

## Commands

- `uv run pytest` - run tests
- `uv run ruff check src/ tests/` - lint
- `uv run ruff format src/ tests/` - format
- `uv run taigi-converter convert -s tl -t poj "tshiu7-a2"` - convert TL to POJ
- `uv run taigi-converter convert -s poj -t tl "chhiu7-a2"` - convert POJ to TL
- `uv run taigi-converter convert -s tl -t zhuyin "tshiu7 a2"` - convert TL to Zhuyin
- `uv run taigi-converter tone-number "Gau5-tsa2"` - tone marks to numbers
- `uv run taigi-converter tone-mark "tshiu7-a2"` - tone numbers to marks
- `uv run taigi-converter legacy -i input.txt -o output.txt` - legacy file conversion

## Conventions

- No comments in code
- English only
- No emojis in code or docs
