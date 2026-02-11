import argparse
import sys
from pathlib import Path

from taigi_converter.converter import TailoTpsConverter, convert, to_tone_mark, to_tone_number


def main():
    parser = argparse.ArgumentParser(description="Taigi phonetic system converter")
    subparsers = parser.add_subparsers(dest="command")

    convert_parser = subparsers.add_parser("convert", help="Convert between TL, POJ, and Zhuyin")
    convert_parser.add_argument("-s", "--source", required=True, choices=["tl", "poj", "zhuyin"])
    convert_parser.add_argument("-t", "--target", required=True, choices=["tl", "poj", "zhuyin"])
    convert_parser.add_argument("text", nargs="?", help="Text to convert")
    convert_parser.add_argument("-i", "--input", help="Input file")
    convert_parser.add_argument("-o", "--output", help="Output file")

    tn_parser = subparsers.add_parser("tone-number", help="Convert tone marks to tone numbers")
    tn_parser.add_argument("text", nargs="?", help="Text to convert")
    tn_parser.add_argument("-i", "--input", help="Input file")
    tn_parser.add_argument("-o", "--output", help="Output file")

    tm_parser = subparsers.add_parser("tone-mark", help="Convert tone numbers to tone marks")
    tm_parser.add_argument("text", nargs="?", help="Text to convert")
    tm_parser.add_argument("-i", "--input", help="Input file")
    tm_parser.add_argument("-o", "--output", help="Output file")
    tm_parser.add_argument("--system", choices=["tl", "poj"], default="tl")

    legacy_parser = subparsers.add_parser("legacy", help="Legacy Tailo-to-Zhuyin file conversion")
    legacy_parser.add_argument("-i", required=True, help="Input file")
    legacy_parser.add_argument("-o", default="output.txt", help="Output file")
    legacy_parser.add_argument("--safe", action="store_true", help="Use unicode-safe TPS encoding")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "legacy":
        input_path = Path(args.i)
        if not input_path.is_file():
            print(f"Error: input file not found: {args.i}", file=sys.stderr)
            sys.exit(1)
        converter = TailoTpsConverter()
        result = converter.convert_file(str(input_path), args.o, encode_safe=args.safe)
        print(f"Conversion success!\nResult to {args.o}:\n{result}")
        return

    text = _get_input_text(args)
    if text is None:
        parser.print_help()
        sys.exit(1)

    if args.command == "convert":
        result = convert(text, args.source, args.target)
    elif args.command == "tone-number":
        result = to_tone_number(text)
    elif args.command == "tone-mark":
        result = to_tone_mark(text, system=args.system)
    else:
        parser.print_help()
        sys.exit(1)

    if hasattr(args, "output") and args.output:
        Path(args.output).write_text(result, encoding="utf-8")
        print(f"Result written to {args.output}")
    else:
        print(result)


def _get_input_text(args):
    if hasattr(args, "text") and args.text:
        return args.text
    if hasattr(args, "input") and args.input:
        input_path = Path(args.input)
        if not input_path.is_file():
            print(f"Error: input file not found: {args.input}", file=sys.stderr)
            sys.exit(1)
        return input_path.read_text(encoding="utf-8")
    if not sys.stdin.isatty():
        return sys.stdin.read()
    return None
