# The Couch UI — a streamlined on-air TV experience

A restyle of OwnTube's TV layout into a broadcast / on-air aesthetic, meant to be
**publicly adoptable by any PeerTube instance** — a cleaner, more streamlined
10-foot experience than vanilla. Everything here is additive and gated, so it
never touches the mobile/desktop faces.

## The one mechanism: `IS_TV_LAYOUT` (opt-in)

`OwnTube.tv/utils/tvPreview.ts` exports the gate every couch treatment keys on. It
is an **opt-in** — the couch look never turns on unless an instance asked for it:

```
IS_TV_LAYOUT = (Platform.isTV || TV_PREVIEW) && (TV_ON_AIR_THEME || TV_PREVIEW)
```

- **Opt-in flag:** a branded app sets `EXPO_PUBLIC_TV_ON_AIR_THEME=1` in its
  `.customizations` (like any other env-var customization — see
  `docs/customizations.md`). This is the public adoption surface: any PeerTube
  instance's branded app flips it on to get the streamlined on-air look.
- A **vanilla TV build** (flag unset) is therefore **unchanged upstream** — no
  couch styling. Only an opted-in build (e.g. the THC build) gets it.
- Couch is a **10-foot surface only**: it applies on tvOS / Android TV (or the web
  preview). An opted-in _web/mobile_ build keeps its normal layout.
- In the **web preview** (`EXPO_PUBLIC_TV_PREVIEW=1 npm run web`) the gate is true
  and the preview _implies_ the on-air theme, so the whole couch design renders in
  a browser for fast iteration — no native build, no extra flag. `IS_TV_PREVIEW_WEB`
  additionally drives focus from hover (no D-pad on web).
- The native focus ENGINE still keys on `Platform.isTV` — do not route D-pad focus
  through these flags. `IS_TV_LAYOUT` gates VISUAL treatments only.
- The opt-in semantics are pinned by `utils/tvPreview.test.ts` (pure
  `computeIsTvLayout` / `computeOnAirTheme` derivations).

## What the couch layout does (all gated on `IS_TV_LAYOUT`)

- **Slim left icon rail** instead of the fat sidebar (`app/_layout.tsx` forces
  `CLOSED_DRAWER_WIDTH`; `components/Sidebar.tsx` forces `shouldExpand=false`).
- **Page hero** — the latest video as a big backdrop with a subtle CRT pass, an
  on-air "NOW SHOWING" amber kicker + red tally light, title, channel
  (`screens/HomeScreen/components/TvHero.tsx`, wired as the SectionList
  `ListHeaderComponent`). Hero text uses theme-invariant `white94/white80` so it
  stays legible on the dark scrim in both light and dark mode.
- **Per-section heroes** — each video section leads with its own compact hero
  (Live / Recently Watched from their first video; Playlists from the first
  playlist's thumbnail; Channels/Categories as titled heroes). They live in the
  section CONTENT (renderItem), so they scroll — while the section marquee stays
  sticky. Latest has no hero (the page hero covers it).
- **Channel marquees** — each section title is a sticky "CH NN" badge + red tally
  - uppercase wide-tracked name (`SectionHeader.tsx`), so the home reads as
    flipping through broadcast channels.
- **Horizontal rows** — rows scroll sideways and bleed off the right edge (the
  "more →" cue) instead of a wrapping grid; wider cards (22vw), scrollbar hidden
  (`components/VideoGrid/VideoGridContent.tsx` + `styles.css` `.grid-container-tv`).
- **CRT screens** — every thumbnail wears a scanline + glass-glare + tube-vignette
  overlay (`components/helpers/CrtScreen.tsx`, per-instance SVG ids, `intensity`
  prop). Scanlines **fade on focus** (intensity 1 → 0.35) — the picture "tunes in".
- **Focus treatment** — the focused card scales 1.14x, lifts, and casts an amber
  phosphor GLOW (`components/helpers/FocusGuide.tsx`, concentric strokes — not a
  border). Its row-neighbors dim/recede (CSS sibling-aware). Hovering the
  thumbnail OR the title triggers it. Row padding leaves room so the glow isn't
  clipped at the top or the first/last card's edge.
- **On-air palette** — amber accent, near-black broadcast-room grounds, warm cream
  ink, tally red (`theme/colors.ts`), matched to the THC platform's `/live` viewer
  and CRT channel wall.
- **No metadata clutter** — the view count and the date line under each tile are
  hidden on the couch (`VideoItemFooter.tsx`).
- **Hero brightens on hover** — the hero image rests at 0.82 opacity and animates
  to full over 260ms on hover (`Animated.Value`, `TvHero.tsx`).
- **Grid toggle is respected** — the couch forces horizontal rows for the home
  rails, but a page with an explicit grid/list toggle (playlist/category) keeps a
  real wrapping grid via `forceGrid` (`VideoGrid.tsx` → `VideoGridContent.tsx`).

## Deliberately NOT done (and why)

- **9:16 portrait posters (Netflix look):** PeerTube serves 16:9 video stills, not
  commissioned portrait key art. Forcing portrait crops or letterboxes every card.
  The design commits to **landscape 16:9** (Apple TV+ / YouTube TV rhythm) — which
  the content and the "television screen" metaphor both fit natively.
- **The literal TV-CABINET frame:** attempted and reverted (`7ce817a`). The frame
  wouldn't fill reliably in react-native-web's box model and read as "a bar behind
  the thumbnail." Worth retrying with a real screenshot to diagnose the DOM.
- **Autoplay video hero:** attempted and reverted (`77ec580`, `76cf503`) — a second
  video.js instance interfered with the shared player and blacked out the watch
  page. Needs an isolated instance + route-focus lifecycle before retrying.

## How to run / see it

```
cd OwnTube.tv
EXPO_PUBLIC_TV_PREVIEW=1 EXPO_PUBLIC_APP_NAME="Thunderhill Cinema" EXPO_PUBLIC_USER_INTERFACE_STYLE=dark npm run web
```

Then open localhost:8081 (tunnel it if the browser is on another host). For the
real 10-foot build, see `thc/TV_SIMULATOR.md` (cloud CI → simulator).

## Public availability

**Opt-in — done.** The couch treatments are gated behind the build-time
`EXPO_PUBLIC_TV_ON_AIR_THEME` customization (above), matching how every branded
app configures itself (`.customizations` env vars). A vanilla TV build is
unchanged; an instance adopts the on-air look by setting the flag. This is the
env-var mechanism the whole branded-app model already uses (one app = one
distributor), so it slots straight into the `cust-app-template` `.customizations`
file — no code fork required for adoption.

**Remaining follow-up — per-instance palette.** The palette is still static in
`colors.ts`. To let each instance colour its own frame, read the admin theme
(`/api/v1/config` `theme.customization.primary_color`) and feed it into the
amber-accent tokens. Small, well-bounded, not yet done.
