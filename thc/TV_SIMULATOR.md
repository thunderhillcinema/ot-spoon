# Seeing THC on the tvOS simulator (with only Xcode 26)

RN 0.76 / Expo SDK 52 need **Xcode 16.x to BUILD**, and Xcode 26 breaks that
build. But Xcode 26's **simulator can RUN** an app built elsewhere. So we build in
the cloud (GitHub runner, Xcode 16.4, no signing) and run the artifact locally.

## 1. Build in the cloud

Push this repo to `thunderhillcinema/ot-spoon`, then trigger the build:

- **GitHub UI:** Actions ▸ "THC tvOS Simulator Build" ▸ Run workflow (pick the
  branch with the branding, e.g. `thc/web-preview`).
- **CLI:** `gh workflow run thc-tvos.yml --ref thc/web-preview`

It runs OwnTube's `build_tvos_simulator_app` reusable workflow on `macos-15` with
Xcode 16.4 — no secrets needed. When green, download the artifact
**`tvos-simulator-app.app`** from the run's Artifacts (a zip containing
`OwnTube.app`), and unzip it.

## 2. Run it on your local tvOS simulator

One-time: install a tvOS simulator runtime (you have iOS, tvOS is separate) —
Xcode ▸ Settings ▸ Components, or `xcodebuild -downloadPlatform tvOS`.

Then, on your Mac (Xcode 26 is fine here — it only _runs_ the sim):

```
# boot an Apple TV simulator (list names with: xcrun simctl list devices tvOS)
xcrun simctl boot "Apple TV"
open -a Simulator

# install + launch the downloaded build
xcrun simctl install booted /path/to/OwnTube.app
xcrun simctl launch booted com.thunderhillcinema.tv
```

If the bundle id differs, read it from the app:
`/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' /path/to/OwnTube.app/Info.plist`

You should get the real 10-foot layout — poster rails, D-pad focus, the `.tv.tsx`
player — in THC amber-on-near-black.

## Notes

- **Forward compatibility:** an app built against an older tvOS SDK runs on a
  newer simulator runtime, so Xcode 26's tvOS sim runs the 16.4-built app.
- **Iteration loop:** each change = push → trigger → wait for CI → download →
  reinstall. Slower than a local build, but it's the price of not having Xcode 16
  locally. If iteration gets painful, the alternatives are a second Mac on macOS
  15 with Xcode 16.4, or waiting for OwnTube upstream to move to an SDK that
  supports Xcode 26.
- **Branding** is baked from source (palette + instances) plus the workflow's env
  (name + dark mode); no external customizations repo is used.
