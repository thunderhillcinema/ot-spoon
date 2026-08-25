# TV UI Map — the couch experience (ot-spoon / OwnTube)

Code-grounded map of OwnTube's TV surface, for THC's carrier initiative. TV was
the _forcing function_ for adopting OwnTube (see `thc/SPINE.md` §1), so this is
the part that matters most. Every claim carries a `file:line` into `OwnTube.tv/`.

> Orientation doc. The TV UI is a **build target** (tvOS / Android TV), not the
> web build — you cannot see it in a browser (`.tv.tsx` variants call
> `react-native-tvos` native APIs that don't exist on web). To view it, build for
> a TV simulator/device (below).

## 1. How TV is built & shipped

- **One codebase, gated by `EXPO_TV`.** `metro.config.js:9` unshifts `.tv.<ext>`
  onto the resolver only when `process.env.EXPO_TV` is set, so `Foo.tv.tsx` wins
  over `Foo.tsx` in a TV build and is invisible otherwise.
- **Run locally (needs a Mac + the CLAUDE.md-pinned Xcode 16.4, or Android Studio):**
  - tvOS: `export EXPO_TV=1 && npx expo prebuild --clean && npx expo run:ios`
  - Android TV: `export EXPO_TV=1 && npx expo prebuild --clean && npx expo run:android`
  - After TV work: `unset EXPO_TV && npx expo prebuild --clean` before mobile.
- **Ship path (real, separate CI jobs):** `.github/workflows/build_tvos_simulator_app.yml`,
  `build_android_tv_apk.yml`, plus `testflight.yml` / `google_play.yml`.
- **TV branding assets** (`app.config.ts:70-83`): `@react-native-tvos/config-tv`
  wired; full Apple TV image set (icon, `topShelf` + wide + 2x) and Android TV
  banner, every one `EXPO_PUBLIC_*`-overridable and gated on `EXPO_TV`. Android TV
  build number is offset +20min to avoid collisions (`app.config.ts:5`).

## 2. The five couch surfaces

### a. TV entry / shell — `app/_layout.tsx`

Boots the same app shell; `Platform.isTV` (`:80`) enables the remote Menu/Back key
via `TVEventControl.enableTVMenuKey()`. Nav drawer is `permanent` on large screens.

### b. Landing / instance picker — `screens/LandingScreen/LandingScreen.tsx`

Reads `featuredInstances` from `AppConfigContext` (`:32`), `handleSelectSource(hostname)`
(`:51`) validates the pick via `useGetInstanceServerConfigQuery` (`:47`) then routes
to `/home?backend=<hostname>`. A custom-instance option (`openCustomSite`, `:144`)
lets a user type a hostname — on TV that typing is done with the on-screen keyboard
(surface _e_). **For a branded THC app this screen is normally hidden** (single
primary backend) — see §3.

### c. Home = rails of posters — `screens/HomeScreen/index.tsx`

A vertical `SectionList` of horizontal `VideoGrid` rails (`:88-153`), in order:
**Live Streams → Latest → Recently Watched → Playlists → Channels → Categories**.
This is the lean-back catalog the spine asked for. Every rail's presence/size is
driven by the instance's `customizations` (`homeHideChannelsOverview`,
`homeMaxPlaylistsOverviewLimit`, `homeFeaturedLives`, …) — i.e. by
`public/featured-instances.json5`. **THC shapes the TV home as DATA, not code.**

### d. Playback — `components/VideoControlsOverlay/VideoControlsOverlay.tv.tsx` (460 lines)

A purpose-built 10-foot player:

- **Remote events:** `useTVEventHandler` (`:141`) handles `playPause` etc.
- **Layout:** top gradient bar = Back / channel link / title(4 lines) / Details /
  Share / Settings (`:212-266`); center transport = **Rewind-15 · Play/Pause · FF-30**,
  Play/Pause holds `hasTVPreferredFocus` so it's the default focus (`:267-297`);
  bottom = focusable scrub bar (`:314+`).
- **Long-press scrub** (`:118, :182-192`): holding FF/RW accelerates the seek
  (`seekTime *= 1.1`) — the couch scrubbing idiom.
- **tvOS 3× scale** (`INTERFACE_SCALE = Platform.isTVOS ? 3 : 1`, `:47`); Android
  hardware-back handling (`:130`); settings popup = quality + speed
  (`PlaybackSettingsPopup`, `:298-312`).

### e. TV text input — `components/TvKeyboard.tsx`

An on-screen D-pad keyboard (`mode: "url"`: a-z, digits, `- _ ~ / .`) for typing an
instance hostname with a remote. OwnTube's built-in answer to the same problem THC
solved with QR-pairing + phone `/remote`. `Picker.tv.tsx` is the D-pad-friendly
dropdown (animated slide + `requestTVFocus`).

## 3. The D-pad focus model (the reusable primitive)

Pure `react-native-tvos`, three tools:

- **`TVFocusGuideView`** (re-exported at `components/helpers/TVFocusGuideHelper/TVFocusGuideHelper.tsx`;
  the `.web.tsx` sibling stubs it) with `autoFocus` / `trapFocus{Up,Down,Left,Right}`
  to corral focus inside a region (e.g. the transport row traps L/R so the D-pad
  can't escape mid-controls — `VideoControlsOverlay.tv.tsx:268`).
- **`nextFocus{Right,Left,Up,Down}`** props to script explicit focus jumps between
  refs (e.g. Back → Details → Share, `:220-258`).
- **Imperative `ref.requestTVFocus()`** to move focus after an action
  (`Picker.tv.tsx:34,76`; settings-popup close, `:308`).
- `hasTVPreferredFocus` sets the initial focus target.
- **Red herring:** `hooks/useCustomFocusManager.ts` is React Query's
  refetch-on-focus, NOT D-pad focus.

## 4. Where THC shapes it — config vs. net-new

**Config/data (the "style our curation, don't build an app" thesis holds):**

- `public/featured-instances.json5` `customizations` → which home rails, their
  sizes, featured lives, hidden playlists.
- `EXPO_PUBLIC_PRIMARY_BACKEND` → THC as the default instance; +
  `customizations.menuHideLeaveButton: true` hides the instance switcher → a
  single-instance couch app (satisfies Apple/Google review; deep links still work).
- `theme/` tokens + `EXPO_PUBLIC_*` → colors, name, TV banner / top-shelf art.
- Publishing THC curation as PeerTube **channels/playlists** → they surface as
  rails for free.

**Net-new `.tv.tsx` work (only if THC's couch idiom ≠ OwnTube's):** surfacing
THC-specific structures (cinema / venue / compilation) as first-class TV rows, or a
THC-flavored playback overlay. This is a design decision, not a given — see
`thc/TV_SURFACE_SPEC.md` (to be written).

## 5. Platform coverage & gaps

| Platform                 | Path                         | Status               |
| ------------------------ | ---------------------------- | -------------------- |
| Apple TV (tvOS)          | RN-tvos build, `EXPO_TV=1`   | wired, CI job exists |
| Android TV / Fire TV     | RN-tvos build, `EXPO_TV=1`   | wired, CI job exists |
| Samsung Tizen / LG webOS | package the static web build | net-new (spine §4)   |
| Roku                     | PeerVue (separate) or defer  | not started          |
| Any smart-TV browser     | existing THC `/tv` LiveView  | fallback baseline    |

**Gaps to close:** THC branding assets (TV banner/top-shelf) don't exist yet; the
THC-specific rails are unspecified; Tizen/webOS packaging is net-new; and no one
has seen the build run on a real TV target yet.
