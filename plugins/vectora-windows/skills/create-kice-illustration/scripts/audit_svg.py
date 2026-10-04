#!/usr/bin/env python3
"""Audit live SVG text against explicitly identified UND v3.0 font faces."""
import argparse
import base64
import binascii
import json
import os
import sys
import unicodedata
from pathlib import Path
import xml.etree.ElementTree as ET

from fontTools.ttLib import TTFont

FAMILIES = {
    "UND v3.0": "main",
    "UND v3.0 Body": "body",
}
FACES = {
    ("main", "regular"): ("UND-v3.0-Regular.otf", "UNDv30-Regular"),
    ("main", "bold"): ("UND-v3.0-Bold.otf", "UNDv30-Bold"),
    ("main", "italic"): ("UND-v3.0-Italic.otf", "UNDv30-Italic"),
    ("body", "regular"): ("UND-v3.0-Body-Regular.otf", "UNDv30Body-Regular"),
    ("body", "bold"): ("UND-v3.0-Body-Bold.otf", "UNDv30Body-Bold"),
    ("body", "italic"): ("UND-v3.0-Body-Italic.otf", "UNDv30Body-Italic"),
}


def _face_key(style):
    weight = style.get("font-weight", "normal").strip().lower()
    italic = style.get("font-style", "normal").strip().lower() in {"italic", "oblique"}
    bold = weight in {"bold", "bolder", "600", "700", "800", "900"}
    if bold and italic:
        return "bold-italic"
    if bold:
        return "bold"
    if italic:
        return "italic"
    if weight not in {"normal", "400", "500"}:
        return "unsupported"
    return "regular"


def _family_key(value):
    value = value.split(",", 1)[0].strip().strip("\"'")
    return FAMILIES.get(unicodedata.normalize("NFC", value))


def _provided_paths(args):
    return {
        ("main", "regular"): args.font,
        ("main", "bold"): args.bold_font,
        ("main", "italic"): args.italic_font,
        ("body", "regular"): args.body_font,
        ("body", "bold"): args.body_bold_font,
        ("body", "italic"): args.body_italic_font,
    }


def _resolve_path(face, provided, anchors):
    explicit = provided.get(face)
    if explicit:
        return explicit if explicit.is_file() else None

    filenames = (FACES[face][0], FACES[face][1] + ".otf")
    roots = []
    anchor = provided.get((face[0], "regular"))
    if anchor:
        roots.append(anchor.parent)
    roots.extend(anchors)
    seen = set()
    for root in roots:
        root = root.expanduser()
        if root not in seen:
            seen.add(root)
            for filename in filenames:
                candidate = root / filename
                if candidate.is_file():
                    return candidate
    return None


def audit(path, args, require_pure_vector=False):
    root = ET.parse(path).getroot()
    issues = []
    runs = []
    raster = 0
    used_files = {}
    loaded_fonts = {}

    provided = _provided_paths(args)
    anchors = [
        Path.home() / "Library" / "Fonts",
        Path.home() / "AppData" / "Local" / "Microsoft" / "Windows" / "Fonts",
        Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts",
    ]

    def record_run(value, style):
        if not value.strip():
            return
        family = unicodedata.normalize("NFC", style.get("font-family", "").strip("\"'"))
        family_key = _family_key(family)
        if family_key is None:
            issues.append("Unsupported or missing font family: " + family + " — " + value[:35])
            return
        face_style = _face_key(style)
        face = (family_key, face_style)
        if face_style == "bold-italic":
            issues.append("No native bold-italic face: " + family + " — " + value[:35])
            return
        if face_style == "unsupported":
            issues.append("Unsupported font weight: " + style.get("font-weight", "") + " — " + value[:35])
            return
        font_path = _resolve_path(face, provided, anchors)
        if font_path is None:
            issues.append("Font face file unavailable: " + family + " " + face_style)
            return
        if face not in loaded_fonts:
            try:
                loaded = TTFont(font_path)
                actual_ps = loaded["name"].getDebugName(6)
                expected_ps = FACES[face][1]
                if actual_ps != expected_ps:
                    issues.append(f"Wrong PostScript face for {family} {face_style}: {actual_ps}")
                loaded_fonts[face] = loaded
                used_files[face] = str(font_path)
            except Exception as exc:
                issues.append(f"Cannot read font face {font_path}: {exc}")
                loaded_fonts[face] = None
        font = loaded_fonts[face]
        if font is not None:
            runs.append((value, family, font, font_path))

    def walk(element, inherited):
        nonlocal raster
        tag = element.tag.split("}")[-1]
        style = {
            **inherited,
            **{key: value for key, value in element.attrib.items()
               if key in {"font-family", "font-weight", "font-style"}},
        }
        inline = {}
        for part in element.get("style", "").split(";"):
            if ":" in part:
                key, value = part.split(":", 1)
                inline[key.strip()] = value.strip()
        style.update(inline)

        if tag in {"foreignObject", "script"}:
            issues.append("Forbidden element: " + tag)
        if tag == "image":
            raster += 1
            href = element.get("href", element.get("{http://www.w3.org/1999/xlink}href", ""))
            if not href:
                issues.append("Image has no source")
            if require_pure_vector:
                issues.append("Raster image in pure-vector request")
        for key, value in element.attrib.items():
            if key.endswith("href") and not value.startswith("#"):
                if tag == "image" and value.startswith(("data:image/png;base64,", "data:image/jpeg;base64,")):
                    try:
                        header, payload = value.split(",", 1)
                        raw = base64.b64decode(payload, validate=True)
                        signature = b"\x89PNG\r\n\x1a\n" if "image/png" in header else b"\xff\xd8\xff"
                        if not raw.startswith(signature):
                            issues.append("Invalid embedded image signature")
                    except (ValueError, binascii.Error):
                        issues.append("Invalid embedded image encoding")
                else:
                    issues.append("External or unsupported resource: " + value[:100])
            if "url(" in value and "url(#" not in value:
                issues.append("External resource: " + value[:100])

        if tag in {"text", "tspan"}:
            record_run(element.text or "", style)
        for child in element:
            walk(child, style)
            if tag in {"text", "tspan"}:
                # SVG stores text after an inline tspan in the child's tail;
                # it inherits the surrounding text element's style.
                record_run(child.tail or "", style)

    walk(root, {})
    missing = set()
    for value, family, font, _font_path in runs:
        cmap = font.getBestCmap()
        for char in value:
            if not char.isspace() and ord(char) not in cmap:
                missing.add((family, char))
    for family, char in sorted(missing):
        issues.append(f"Missing glyph U+{ord(char):04X} ({char}) in {family}")

    for font in loaded_fonts.values():
        if font is not None:
            font.close()

    families = sorted({family for _value, family, _font, _path in runs})
    return {
        "file": str(path),
        "font": "UND v3.0",
        "fontFamilies": families,
        "fontFiles": sorted(set(used_files.values())),
        "textRuns": len(runs),
        "uniqueCharacters": len(set("".join(value for value, *_ in runs))),
        "vectorPaths": sum(1 for element in root.iter() if element.tag.endswith("}path")),
        "rasterImages": raster,
        "artworkMode": "hybrid" if raster else "vector",
        "requirePureVector": require_pure_vector,
        "missingGlyphs": sorted({char for _family, char in missing}),
        "issues": issues,
        "passed": not issues,
        "visualReviewRequired": True,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("svg", nargs="+", type=Path)
    parser.add_argument("--font", type=Path, help="UND v3.0 Regular OTF")
    parser.add_argument("--bold-font", type=Path, help="UND v3.0 Bold OTF")
    parser.add_argument("--italic-font", type=Path, help="UND v3.0 Italic OTF")
    parser.add_argument("--body-font", type=Path, help="UND v3.0 Body Regular OTF")
    parser.add_argument("--body-bold-font", type=Path, help="UND v3.0 Body Bold OTF")
    parser.add_argument("--body-italic-font", type=Path, help="UND v3.0 Body Italic OTF")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--require-pure-vector", action="store_true",
                        help="Reject raster only when the user requires pure-vector artwork")
    args = parser.parse_args()

    results = [audit(svg, args, args.require_pure_vector) for svg in args.svg]
    output = json.dumps(results, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(output)
    print(output)
    return 0 if all(result["passed"] for result in results) else 1


if __name__ == "__main__":
    sys.exit(main())
