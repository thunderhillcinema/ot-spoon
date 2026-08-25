#!/usr/bin/env bash
# thc/tv-install.sh — pull the latest CI tvOS build and run it on the simulator.
#
# RUN ON YOUR MAC, after a CI build goes green (Actions → build_tvos_simulator_app ✓).
# Turns the per-build reinstall into one command:
#
#   bash thc/tv-install.sh
#
# It downloads the newest `tvos-simulator-app.app` artifact, re-wraps it as a .app
# (GitHub artifacts drop the .app wrapper — it uploads the bundle CONTENTS), and
# installs + launches it on a booted Apple TV simulator.
set -euo pipefail

REPO=thunderhillcinema/ot-spoon
APP_DEVICE="${TV_SIM_DEVICE:-Apple TV 4K (3rd generation)}"

rm -rf tvbuild OwnTubetv.app
echo "==> downloading latest tvos-simulator-app.app from $REPO ..."
gh run download -R "$REPO" -n tvos-simulator-app.app -D tvbuild

echo "==> re-wrapping bundle contents as OwnTubetv.app ..."
cp -R tvbuild OwnTubetv.app
chmod +x OwnTubetv.app/OwnTubetv
BUNDLE=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' OwnTubetv.app/Info.plist)
echo "    bundle id: $BUNDLE"

# Boot an Apple TV simulator if none is booted.
if ! xcrun simctl list devices booted 2>/dev/null | grep -qi "Apple TV"; then
  echo "==> booting \"$APP_DEVICE\" ..."
  xcrun simctl boot "$APP_DEVICE" || true
  open -a Simulator
  sleep 6
fi

echo "==> installing + launching ..."
xcrun simctl install booted OwnTubetv.app
xcrun simctl launch booted "$BUNDLE"
echo "==> launched $BUNDLE — navigate with arrow keys, Return to select."
