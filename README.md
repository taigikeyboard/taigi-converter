# taigi-converter

台語通用轉換器 — bidirectional converter between Taigi phonetic systems: TL (台語羅馬字), POJ (白話字), TPS (台語注音), and tone number/mark formats.

## Features

- Convert between TL, POJ, and TPS
- Tone mark to tone number conversion (and vice versa)
- Handles mixed text with punctuation and hyphens
- Preserves letter casing
- Real-time web interface with all formats displayed simultaneously

## Web

Live at [taigikeyboard.tw](https://taigikeyboard.tw) — type TL or POJ and see all conversions instantly.

## API

```js
import { convert, toToneNumber, toToneMark } from "./src/converter.js";

convert("tshiu-a", "tl", "poj");       // "chhiu-a"
convert("chhiu-a", "poj", "tl");       // "tshiu-a"
convert("tshiu7 a2", "tl", "zhuyin");  // TPS output

toToneNumber("Gau-tsa");               // "Gau5-tsa2"
toToneMark("tshiu7-a2");               // "tshiu-a"
toToneMark("tshiu7-a2", "poj");        // "chhiu-a"
```

## Development

- **Runtime**: Node.js 22+
- **Test framework**: `node:test` (built-in)
- No external dependencies

```bash
node --test tests/
```
