#!/usr/bin/env bash
# thc/tv-build.sh — build & launch the THC OwnTube app on the tvOS SIMULATOR.
#
# RUN THIS ON YOUR MAC (not in the Lima VM) — it drives Xcode/xcodebuild, which
# only exist on macOS. The source lives on a shared Lima mount, so the same
# OwnTube.tv/ dir is visible from macOS; cd to it there and run this.
#
#   bash thc/tv-build.sh
#
# It sets the THC branding env (name + dark mode), does an EXPO_TV prebuild, and
# launches on an Apple TV simulator. The THC palette + curated instances are
# already in the source (branch thc/web-preview).
set -euo pipefail

cd "$(dirname "$0")/../OwnTube.tv"
echo "==> OwnTube.tv at: $(pwd)"

# ── 0. macOS only ────────────────────────────────────────────────────────────
if [ "$(uname)" != "Darwin" ]; then
  echo "STOP: run this on macOS. Xcode/simulators don't exist in the Linux VM."
  exit 1
fi

# ── 1. Xcode version guard (THE landmine) ────────────────────────────────────
# RN 0.76 / Expo SDK 52 need Xcode 16.x. Apple jumped 16 → 26, and 26.x BREAKS
# this build. See ot-spoon CLAUDE.md "macOS Runner & Xcode Version".
XCODE_VER="$(xcodebuild -version 2>/dev/null | head -1 | awk '{print $2}')"
XCODE_MAJOR="${XCODE_VER%%.*}"
echo "==> Xcode $XCODE_VER"
if [ -z "$XCODE_MAJOR" ]; then
  echo "STOP: xcodebuild not found. Install Xcode 16.4 and run: sudo xcode-select -s /Applications/Xcode.app"
  exit 1
fi
if [ "$XCODE_MAJOR" -ge 17 ]; then
  echo "STOP: Xcode $XCODE_VER is incompatible with React Native 0.76 (needs 16.x)."
  echo "      Install Xcode 16.4, then point the toolchain at it, e.g.:"
  echo "        sudo xcode-select -s /Applications/Xcode_16.4.app"
  echo "      Verify with: xcodebuild -version  (must print 16.x)"
  exit 1
fi

# ── 2. tvOS simulator runtime present? ───────────────────────────────────────
if ! xcrun simctl list runtimes 2>/dev/null | grep -qi "tvOS"; then
  echo "STOP: no tvOS simulator runtime installed (you have iOS, tvOS is separate)."
  echo "      Get it one of two ways:"
  echo "        • Xcode ▸ Settings ▸ Components ▸ install a tvOS Simulator, or"
  echo "        • xcodebuild -downloadPlatform tvOS"
  exit 1
fi
echo "==> tvOS runtime: $(xcrun simctl list runtimes | grep -i tvOS | head -1 | sed 's/ (.*//')"

# ── 3. JS deps ───────────────────────────────────────────────────────────────
# node_modules may have been installed under Linux (for the web preview). The
# JS + patch-package patches are cross-platform and the NATIVE side is rebuilt by
# CocoaPods during the run, so this usually works as-is. If the build dies with
# native/binary errors, do a clean Mac install:  rm -rf node_modules && npm install
if [ ! -d node_modules ]; then
  echo "==> installing JS deps (npm install)..."
  npm install
fi

# ── 4. THC branding env (source already carries palette + instances) ─────────
export EXPO_TV=1
export EXPO_PUBLIC_APP_NAME="Thunder Hill Cinema"
export EXPO_PUBLIC_APP_SLUG="thunderhillcinema"
export EXPO_PUBLIC_USER_INTERFACE_STYLE="dark"

# ── 5. prebuild the tvOS native project, then build & launch ─────────────────
echo "==> EXPO_TV prebuild (regenerates the tvOS native project)..."
npx expo prebuild --clean

echo "==> building + launching on the tvOS simulator (first build is slow)..."
echo "    If it doesn't auto-pick an Apple TV, re-run: EXPO_TV=1 npx expo run:ios --device"
npx expo run:ios

# ── After TV work, before any MOBILE build, reset the native project: ─────────
#   unset EXPO_TV && npx expo prebuild --clean
echo "==> Done. To return to mobile builds later: unset EXPO_TV && npx expo prebuild --clean"
