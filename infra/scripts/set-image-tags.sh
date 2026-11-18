#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <immutable-image-tag> <image-digest>" >&2
  exit 2
fi

tag="$1"
digest="$2"
case "$tag" in
  ''|*[!A-Za-z0-9_.-]*)
    echo "Invalid image tag: $tag" >&2
    exit 2
    ;;
esac
printf '%s\n' "$digest" | grep -Eq '^sha256:[a-f0-9]{64}$' || {
  echo "Invalid image digest: $digest" >&2
  exit 2
}

# The site image keeps its digest next to the version tag, so the Deployment
# runs <image>:<version>@<digest>: immutable, and the portal can read the version.
script_dir="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
kustomization="$script_dir/../k8s/kustomization.yaml"
temporary="$(mktemp "$kustomization.XXXXXX")"
trap 'rm -f -- "$temporary"' EXIT HUP INT TERM
awk -v tag="$tag" -v digest="$digest" '
  /^  - name:/ {
    site = ($0 ~ /^  - name: [^ ]+\/site$/)
    print
    if (site) { print "    newTag: " tag; print "    digest: " digest; count++ }
    next
  }
  site && /^    (newTag|digest):/ { next }
  { print }
  END { if (count != 1) exit 1 }
' "$kustomization" > "$temporary" || {
  echo 'Expected one website image in the Kustomization' >&2
  exit 1
}
cat "$temporary" > "$kustomization"
