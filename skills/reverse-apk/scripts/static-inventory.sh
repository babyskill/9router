#!/usr/bin/env bash
# static-inventory.sh — Phase 1 of reverse-apk skill.
# Extracts a raw, machine-readable inventory from an apktool-decoded APK directory.
# Usage: bash static-inventory.sh <APK_DIR>
# Output: <APK_DIR>/_re_map/raw/*.txt  +  a summary to stdout.
set -euo pipefail

APK_DIR="${1:-}"
if [[ -z "$APK_DIR" || ! -d "$APK_DIR" ]]; then
  echo "ERROR: pass a decompiled APK directory. Usage: static-inventory.sh <APK_DIR>" >&2
  exit 1
fi
APK_DIR="$(cd "$APK_DIR" && pwd)"
MANIFEST="$APK_DIR/AndroidManifest.xml"
if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: AndroidManifest.xml not found in $APK_DIR — is it apktool-decoded?" >&2
  echo "       If not decompiled yet, run the android-re-analyzer skill (/decompile) first." >&2
  exit 1
fi

OUT="$APK_DIR/_re_map/raw"
mkdir -p "$OUT"

say() { printf '  • %-22s %s\n' "$1" "$2"; }
# grep helper that never aborts the script under set -e
g() { grep -Eo "$@" 2>/dev/null || true; }

echo "==> reverse-apk static inventory: $APK_DIR"

# --- App identity -----------------------------------------------------------
{
  echo "# App identity"
  echo "package: $(g 'package="[^"]*"' "$MANIFEST" | head -1 | sed -E 's/package="([^"]*)"/\1/')"
  if [[ -f "$APK_DIR/apktool.yml" ]]; then
    g 'versionName: .*' "$APK_DIR/apktool.yml" | head -1
    g 'versionCode: .*' "$APK_DIR/apktool.yml" | head -1
    g 'minSdkVersion: .*' "$APK_DIR/apktool.yml" | head -1
    g 'targetSdkVersion: .*' "$APK_DIR/apktool.yml" | head -1
  fi
} > "$OUT/00_app_identity.txt"

# --- Manifest components ----------------------------------------------------
# Activities / services / receivers / providers (name attr per element).
# apktool manifests are pretty-printed: each component opens on its own line with
# android:name on that same line — so a per-line grep is the most robust extractor.
extract_components() {
  local tag="$1" outfile="$2"
  grep -hoE "<$tag [^>]*android:name=\"[^\"]*\"" "$MANIFEST" 2>/dev/null \
    | sed -E 's/.*android:name="([^"]*)".*/\1/' \
    | sort -u > "$outfile" || true
}
extract_components "activity"          "$OUT/10_activities.txt"
extract_components "activity-alias"    "$OUT/10_activity_aliases.txt"
extract_components "service"           "$OUT/11_services.txt"
extract_components "receiver"          "$OUT/12_receivers.txt"
extract_components "provider"          "$OUT/13_providers.txt"

# Permissions
g 'uses-permission android:name="[^"]*"' "$MANIFEST" \
  | sed -E 's/.*name="([^"]*)"/\1/' | sort -u > "$OUT/14_permissions.txt" || true

# Launcher activity (intent-filter MAIN/LAUNCHER)
tr '\n' ' ' < "$MANIFEST" | sed -E 's/></>\n</g' \
  | grep -iE 'LAUNCHER|MAIN|android:name' \
  > "$OUT/15_launcher_block.txt" || true

# Deep links (scheme/host/path data)
{
  g 'android:scheme="[^"]*"' "$MANIFEST"
  g 'android:host="[^"]*"'   "$MANIFEST"
  g 'android:path[A-Za-z]*="[^"]*"' "$MANIFEST"
} | sort -u > "$OUT/16_deeplink_schemes.txt" || true

# Exported components
tr '\n' ' ' < "$MANIFEST" | sed -E 's/></>\n</g' \
  | grep -E 'android:exported="true"' > "$OUT/17_exported.txt" || true

# --- Resources --------------------------------------------------------------
find "$APK_DIR/res" -type f -name '*.xml' -path '*/layout*/*' 2>/dev/null \
  | sed "s#$APK_DIR/##" | sort > "$OUT/20_layouts.txt" || true
find "$APK_DIR/res" -type f -path '*/values*/strings.xml' 2>/dev/null | sort > "$OUT/21_strings_files.txt" || true
find "$APK_DIR/res" -type f -path '*/values*/colors.xml'  2>/dev/null | sort > "$OUT/22_colors_files.txt" || true
find "$APK_DIR/res" -type f -path '*/values*/styles.xml'  2>/dev/null | sort > "$OUT/23_styles_files.txt" || true
find "$APK_DIR/res" -type f \( -name '*.png' -o -name '*.webp' -o -name '*.jpg' -o -name '*.xml' \) -path '*/drawable*/*' 2>/dev/null \
  | sed "s#$APK_DIR/##" | sort > "$OUT/24_drawables.txt" || true
[[ -d "$APK_DIR/assets" ]] && find "$APK_DIR/assets" -type f 2>/dev/null | sed "s#$APK_DIR/##" | sort > "$OUT/25_assets.txt" || true
[[ -d "$APK_DIR/lib" ]] && find "$APK_DIR/lib" -type f -name '*.so' 2>/dev/null | sed "s#$APK_DIR/##" | sort -u > "$OUT/26_native_libs.txt" || true

# --- SDK signatures (from smali package paths) ------------------------------
SMALI_DIRS=$(find "$APK_DIR" -maxdepth 1 -type d -name 'smali*' 2>/dev/null)
if [[ -n "$SMALI_DIRS" ]]; then
  {
    for d in $SMALI_DIRS; do find "$d" -maxdepth 4 -type d 2>/dev/null; done
  } | sed "s#$APK_DIR/##" \
    | grep -E 'smali[^/]*/(com|io|org|net)/' \
    | sed -E 's#smali[^/]*/##' \
    | cut -d/ -f1-3 | sort | uniq -c | sort -rn \
    | head -120 > "$OUT/30_sdk_package_signatures.txt" || true

  # Known SDK fingerprints
  KNOWN='retrofit2|okhttp3|com/squareup|com/google/firebase|com/google/android/gms|com/facebook|com/applovin|com/google/ads|com/unity3d|io/reactivex|dagger|hilt|com/bumptech/glide|com/squareup/picasso|androidx/room|realm|com/amplitude|com/mixpanel|com/appsflyer|com/adjust|com/revenuecat|com/android/billingclient|com/onesignal'
  grep -rhoE "$KNOWN" $SMALI_DIRS 2>/dev/null | sort | uniq -c | sort -rn > "$OUT/31_known_sdks.txt" || true

  # --- API endpoints ---------------------------------------------------------
  grep -rhoE 'https?://[a-zA-Z0-9._~:/?#@!$&'"'"'()*+,;=%-]+' $SMALI_DIRS "$APK_DIR/res" "${APK_DIR}/assets" 2>/dev/null \
    | sed -E 's/\\u00[0-9a-fA-F]{2}//g' \
    | grep -vE 'schemas\.android\.com|w3\.org|apache\.org|google\.com/apis/xml|/ns/' \
    | sort -u > "$OUT/40_urls.txt" || true
  # base hosts only
  g 'https?://[^/"\\ ]+' "$OUT/40_urls.txt" | sort -u > "$OUT/41_hosts.txt" || true

  # --- Storage hints ---------------------------------------------------------
  grep -rhoE 'getSharedPreferences|SharedPreferences|Room|SQLiteOpenHelper|\.db"|DataStore' $SMALI_DIRS 2>/dev/null \
    | sort | uniq -c | sort -rn > "$OUT/50_storage_hints.txt" || true
fi

# --- Summary ----------------------------------------------------------------
cnt() { wc -l < "$1" 2>/dev/null | tr -d ' '; }
echo "==> Summary"
say "package"        "$(sed -n 's/^package: //p' "$OUT/00_app_identity.txt")"
say "activities"     "$(cnt "$OUT/10_activities.txt")"
say "services"       "$(cnt "$OUT/11_services.txt")"
say "receivers"      "$(cnt "$OUT/12_receivers.txt")"
say "providers"      "$(cnt "$OUT/13_providers.txt")"
say "permissions"    "$(cnt "$OUT/14_permissions.txt")"
say "layouts"        "$(cnt "$OUT/20_layouts.txt")"
say "drawables"      "$(cnt "$OUT/24_drawables.txt")"
say "native libs"    "$(cnt "$OUT/26_native_libs.txt" 2>/dev/null)"
say "known SDKs"     "$(cnt "$OUT/31_known_sdks.txt" 2>/dev/null)"
say "unique hosts"   "$(cnt "$OUT/41_hosts.txt" 2>/dev/null)"
echo "==> Raw inventory written to: $OUT"
echo "    Next: build 01_APP_MAP.md / 02_SCREEN_INVENTORY.md / 03_RESOURCE_INVENTORY.md / 04_TECHNICAL_FINDINGS.md"
echo "    Scaffold them with: bash scripts/scaffold-maps.sh \"$APK_DIR\""
