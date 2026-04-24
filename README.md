# taigi-converter

Bidirectional converter between Taiwanese Hokkien phonetic systems: TL (Tai-lo), POJ (Pe-oh-e-ji), and TPS (方音符號), with tone mark / tone number conversion.

## Features

- Convert between TL, POJ, and TPS
- Tone mark ↔ tone number conversion
- Handles mixed text with punctuation and hyphens
- Preserves letter casing

## Install

```bash
npm install -g @taigikeyboard/taigi
```

Or run without installing:

```bash
npx -p @taigikeyboard/taigi tai -f tl -t poj "peh8-oe7-ji7"
```

## CLI

```
tai -f <system> -t <system> [--tone mark|number] [--ascii] [text...]
```

Systems: `tl`, `poj`, `tps`. Input comes from arguments, or from stdin if none given.

```bash
tai -f tl -t poj "peh8-oe7-ji7"              # pe̍h-ōe-jī
echo "tai5-gi2" | tai -f tl -t tps           # ㄉㄞˊ ㆣㄧˋ
tai -f tl -t tl --tone number "pe̍h-ōe-jī"   # peh8-oe7-ji7
tai -f poj -t poj --tone number --ascii "o͘-á"
```

`--tone` applies when `--from` and `--to` are the same (TL or POJ). `--ascii` rewrites POJ `o͘`/`ⁿ` as `oo`/`nn`.

## API

```js
import { convert, toToneNumber, toToneMark } from "@taigikeyboard/taigi";

convert("tshiu-a", "tl", "poj");       // "chhiu-a"
convert("chhiu-a", "poj", "tl");       // "tshiu-a"
convert("tshiu7 a2", "tl", "zhuyin");  // TPS output

toToneNumber("Gâu-tsá");               // "Gau5-tsa2"
toToneMark("tshiu7-a2");               // "tshiú-á"
toToneMark("tshiu7-a2", "poj");        // "chhiú-á"
```

Note: the programmatic API uses `"zhuyin"` as the system name for TPS.

## Web

Live at [taigikeyboard.tw](https://taigikeyboard.tw).

## Development

Node.js 22+, no dependencies, tests via built-in `node:test`.

```bash
npm test
```
