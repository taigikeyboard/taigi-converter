#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { convert, toToneMark, toToneNumber } from "../src/converter.js";

const SYSTEM_ALIASES = { tl: "tl", poj: "poj", tps: "zhuyin" };

const HELP = `Usage: tai -f <system> -t <system> [options] [text...]

Convert between Taiwanese phonetic systems.

Systems:
  tl          Tai-lo (Taiwanese Romanization System)
  poj         Pe-oh-e-ji (Church Romanization)
  tps         Taiwanese Phonetic Symbols (方音符號)

Options:
  -f, --from <system>    Source system (required)
  -t, --to <system>      Target system (required)
      --tone <mark|number>
                         Tone format for output when --from equals --to
      --ascii            Replace POJ o͘/ⁿ with oo/nn in output
  -h, --help             Show this help
  -v, --version          Show version

Input is taken from positional arguments, or from stdin if none given.

Examples:
  tai -f tl -t poj "pe̍h-ōe-jī"
  echo "tai5-gi2" | tai -f tl -t tps
  tai -f poj -t tl --tone number < input.txt > output.txt
  tai -f tl -t poj --ascii "o͘-á"
`;

function fail(msg, code = 2) {
  process.stderr.write(`tai: ${msg}\n`);
  if (code === 2) process.stderr.write(`Try 'tai --help' for usage.\n`);
  process.exit(code);
}

function resolveSystem(name, flag) {
  if (!name) fail(`missing --${flag}`);
  const key = name.toLowerCase();
  if (!(key in SYSTEM_ALIASES)) fail(`unknown system '${name}' for --${flag} (expected tl, poj, or tps)`);
  return SYSTEM_ALIASES[key];
}

function applyAscii(text) {
  return text
    .replaceAll("o͘", "oo")
    .replaceAll("O͘", "OO")
    .replaceAll("ⁿ", "nn")
    .replaceAll("ᴺ", "NN");
}

async function readStdin() {
  let data = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function readVersion() {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
  return pkg.version;
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        from: { type: "string", short: "f" },
        to: { type: "string", short: "t" },
        tone: { type: "string" },
        ascii: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
      },
      allowPositionals: true,
      strict: true,
    });
  } catch (err) {
    fail(err.message);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    process.stdout.write(HELP);
    return;
  }
  if (values.version) {
    process.stdout.write(readVersion() + "\n");
    return;
  }

  const from = resolveSystem(values.from, "from");
  const to = resolveSystem(values.to, "to");

  if (values.tone && !["mark", "number"].includes(values.tone)) {
    fail(`invalid --tone '${values.tone}' (expected mark or number)`);
  }
  if (values.tone && from !== to) {
    fail(`--tone only applies when --from and --to are the same system`);
  }
  if (values.tone && from === "zhuyin") {
    fail(`--tone does not apply to tps`);
  }

  let input;
  if (positionals.length > 0) {
    input = positionals.join(" ");
  } else if (!process.stdin.isTTY) {
    input = await readStdin();
  } else {
    fail(`no input (pass text as arguments or pipe via stdin)`);
  }

  let output;
  try {
    if (from === to) {
      if (values.tone === "number") {
        output = toToneNumber(input);
      } else if (values.tone === "mark") {
        output = toToneMark(input, from);
      } else {
        output = input;
      }
    } else {
      output = convert(input, from, to);
    }
  } catch (err) {
    fail(err.message, 1);
  }

  if (values.ascii) output = applyAscii(output);

  process.stdout.write(output);
}

process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") process.exit(0);
  throw err;
});

main().catch((err) => fail(err.message, 1));
