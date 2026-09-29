#!/usr/bin/env python3
"""Create the deterministic runtime payload used by the Claude marketplace plugin."""
import os
import sys
import zipfile
from pathlib import Path

root = Path(sys.argv[1]).resolve()
node_root = root / "node_modules"
python_root = root / "python"
archive_path = root / "runtime-vendor.zip"
excluded_dirs = {
    ".bin", ".github", ".nyc_output", ".vscode", "__pycache__", "benchmark",
    "benchmarks", "coverage", "docs", "example", "examples", "test", "tests",
}
license_prefixes = ("license", "notice", "copying", "patents", "authors", "copyright")


def node_runtime_file(path):
    relative = path.relative_to(node_root)
    if any(part.lower() in excluded_dirs for part in relative.parts[:-1]):
        return False
    name = path.name
    if name == ".package-lock.json" or name.endswith((".pyc", ".map")):
        return False
    if path.suffix.lower() in {".md", ".markdown", ".ts", ".tsx", ".flow"}:
        return name.lower().startswith(license_prefixes)
    return True


def files_under(directory):
    for current, dirs, files in os.walk(directory):
        dirs[:] = sorted(name for name in dirs if name not in excluded_dirs and name != "__pycache__")
        for name in sorted(files):
            path = Path(current) / name
            if not name.endswith(".pyc"):
                yield path


entries = []
for source in files_under(node_root):
    if not node_runtime_file(source):
        continue
    entries.append((f"node_modules/{source.relative_to(node_root).as_posix()}", source))
for source in files_under(python_root):
    entries.append((f"python/{source.relative_to(python_root).as_posix()}", source))
if not entries:
    raise SystemExit("No runtime dependencies were found.")

with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name, source in sorted(entries):
        info = zipfile.ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (0o100644 << 16)
        info.create_system = 3
        archive.writestr(info, source.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

print(f"{archive_path} ({len(entries)} files, {archive_path.stat().st_size} bytes)")
