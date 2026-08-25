# The Couch UI — a streamlined on-air TV experience

A restyle of OwnTube's TV layout into a broadcast / on-air aesthetic, meant to be
**publicly adoptable by any PeerTube instance** — a cleaner, more streamlined
10-foot experience than vanilla. Everything here is additive and gated, so it
never touches the mobile/desktop faces.

## The one mechanism: `IS_TV_LAYOUT`

`OwnTube.tv/utils/tvPreview.ts` exports the gate every couch treatment keys on:

```
IS_TV_LAYOUT = Platform.isTV || process.env.EXPO_PUBLIC_TV_PREVIEW === "1"
```

- On a **real TV build** (`EXPO_TV=1`) it is true via `Platform.isTV`.
- In the **web preview** (`EXPO_PUBLIC_TV_PREVIEW=1 npm run web`) it is true too, so
  the whole couch design renders in a browser for fast iteration — no native build
  needed. `IS_TV_PREVIEW_WEB` additionally drives focus from hover (no D-pad on web).
- The native focus ENGINE still keys on `Platform.isTV` — do not route D-pad focus
  through the preview flag. `IS_TV_LAYOUT` gates VISUAL treatments only.

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

## Toward public availability

To make this adoptable by any instance, the couch treatments should become an
**opt-in customization** (an `instanceConfigs.ts` flag, e.g. `tvOnAirTheme`)
rather than always-on when `IS_TV_LAYOUT`, so an instance chooses the streamlined
on-air look. Palette should read from the instance's own admin theme
(`/api/v1/config` `theme.customization.primary_color`) so each instance colours
its own frame — the client theme is static in `colors.ts` today. Both are small,
well-bounded follow-ups.
