# taigi-converter

## Overview

- Bidirectional converter between Taigi phonetic systems: TL, POJ, Zhuyin (TPS), and Taiwanese braille
- Supports tone mark / tone number conversion
- Published to npm as `@taigikeyboard/taigi-cli` (library + `tai` CLI)
- Ported and extended from [Tailo-TPS-Converter](references/Tailo-TPS-Converter) and [KeSi](references/KeSi)

## Project Structure

- `src/` - ES module source
  - `tables.js` - all mapping data (initials, finals, tones, TL/POJ/Zhuyin maps)
  - `phonetics.js` - syllable parsing (`parseSyllable`, `stripToneMark`, `isStopTone`)
  - `tl.js` - TL (Tai-lo) assembly with tone mark placement
  - `poj.js` - POJ (Pe-oh-e-ji) assembly with tone mark placement
  - `zhuyin.js` - Zhuyin/TPS conversion (tone-numbered TL input)
  - `braille.js` - Taiwanese braille conversion
  - `segmenter.js` - word segmentation (`segmentWords`) over `dictionary.js`
  - `dictionary.js` - generated word data (`npm run build:dict`, from `scripts/build-dictionary.js`)
  - `converter.js` - public API (`convert`, `toToneNumber`, `toToneMark`)
  - `index.js` - re-exports public API
- `bin/tai.js` - the `tai` CLI
- `tests/` - test suite (Node.js built-in test runner)
- `index.html` - single-page web interface
- `references/` - original reference implementations (gitignored)

## Development

- **Runtime**: Node.js 22+
- **Test framework**: `node:test` (built-in)
- One runtime dependency: `@kemdict/kesi`

## Commands

- `npm test` - run tests
- `make serve` - local web testing at http://localhost:8000

## Web Interface

- `index.html` - Single-page app importing from `./src/converter.js`
- Deployed to GitHub Pages via `.github/workflows/deploy.yml`
- No build step required - pure HTML/CSS/JS with ES modules

## Conventions

- No comments in code
- English only
- No emojis in code or docs
