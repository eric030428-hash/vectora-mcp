#!/bin/sh
set -eu
vectora_app=${1:-}
case "$vectora_app" in /*.app) ;; *) echo 'Usage: configure-app.sh /absolute/path/Vectora.app' >&2; exit 64 ;; esac
if [ ! -x "$vectora_app/Contents/MacOS/Vectora" ]; then echo 'Vectora executable not found.' >&2; exit 66; fi
vectora_directory="$HOME/Library/Application Support/Vectora"
mkdir -p "$vectora_directory"
vectora_temp=$(mktemp "$vectora_directory/.mcp-app-path.XXXXXX")
trap 'rm -f "$vectora_temp"' EXIT HUP INT TERM
printf '%s\n' "$vectora_app" > "$vectora_temp"
mv -f "$vectora_temp" "$vectora_directory/mcp-app-path"
printf 'Vectora MCP app: %s\n' "$vectora_app"
