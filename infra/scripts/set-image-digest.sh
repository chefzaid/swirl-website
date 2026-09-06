#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 && "$1" =~ ^sha256:[a-f0-9]{64}$ ]] || {
  printf 'Usage: %s sha256:<64 lowercase hexadecimal characters>\n' "$0" >&2
  exit 2
}
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 - "$script_dir/../k8s/kustomization.yaml" "$1" <<'PY'
from pathlib import Path
import re
import sys

manifest = Path(sys.argv[1])
updated, count = re.subn(
    r'(  - name: registry\.swirlit\.dev/swirlit/website/site\n)    (?:newTag|digest): [^\n]+',
    lambda match: match[1] + '    digest: ' + sys.argv[2],
    manifest.read_text(),
)
if count != 1:
    raise SystemExit('Expected exactly one website image in the Kustomization')
manifest.write_text(updated)
PY
