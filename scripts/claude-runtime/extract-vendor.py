#!/usr/bin/env python3
"""Safely unpack the pinned runtime ZIP into a temporary staging directory."""
import stat
import sys
import zipfile
from pathlib import Path, PurePosixPath

archive_path = Path(sys.argv[1])
destination = Path(sys.argv[2]).resolve()
files = 0
with zipfile.ZipFile(archive_path) as archive:
    for item in archive.infolist():
        relative = PurePosixPath(item.filename)
        if relative.is_absolute() or not relative.parts or any(part in ("", ".", "..") for part in relative.parts):
            raise SystemExit(f"Unsafe runtime archive entry: {item.filename}")
        mode = item.external_attr >> 16
        if stat.S_ISLNK(mode) or item.is_dir():
            raise SystemExit(f"Unsupported runtime archive entry: {item.filename}")
        target = (destination / Path(*relative.parts)).resolve()
        if destination not in target.parents:
            raise SystemExit(f"Runtime archive entry escapes its target: {item.filename}")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(archive.read(item))
        files += 1
if not files:
    raise SystemExit("Runtime dependency archive is empty.")
print(files)
