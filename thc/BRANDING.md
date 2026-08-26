# THC Branding & Config Playbook (Step b)

How to turn vanilla OwnTube into the THC couch app. This is the **mechanism +
decision checklist** — every branding lever with a `file:line`, a ready env
scaffold, and a probed starter instance list. It stops where THC's own inputs are
required (brand assets, a primary backend, a simulator to verify) — those are
flagged ⛔.

> **Where THC branding ultimately lives:** OwnTube's model is a _separate_ branded
> app repo made from `cust-app-template` (its CLAUDE.md §"Branded App
> Architecture"), pulling code from this fork + applying a `.customizations` file +
> `EXPO_PUBLIC_*` env. Heavy branding should land in a future `cust-app-thc`, not
> as edits to this fork's vanilla defaults. This doc is the source of truth for
> what that repo sets.

## 1. Branding levers (all build-time)

| Lever                     | Where                                                                           | THC value                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| App name / slug           | `EXPO_PUBLIC_APP_NAME` / `_APP_SLUG` (`app.config.ts:13-14`)                    | "Thunder Hill Cinema" / "thunderhillcinema"                                                          |
| Primary backend           | `EXPO_PUBLIC_PRIMARY_BACKEND` (+ `customizations.menuHideLeaveButton`)          | ⛔ needs a THC PeerTube host (pt-knife not deployed) — stand-in below                                |
| Theme colors              | `theme/colors.ts` `theme50…theme950` scale, light+dark (`:37-80`)               | ⛔ THC brand palette (note: OwnTube's default splash is cinema-orange `#F95F1E`, `app.config.ts:23`) |
| App icon / splash         | `EXPO_PUBLIC_ICON` / `_SPLASH_IMAGE` / `_SPLASH_BG_COLOR`                       | ⛔ THC logo assets                                                                                   |
| **TV banner / top-shelf** | `EXPO_PUBLIC_ANDROID_TV_BANNER`, `_APPLE_TV_TOP_SHELF*` (`app.config.ts:73-83`) | ⛔ THC TV art (1920×720 top-shelf, Android TV banner)                                                |
| Deploy URL (root path)    | `EXPO_PUBLIC_CUSTOM_DEPLOYMENT_URL` or `_BASE_URL=/`                            | THC domain via cloudflared (default `/web-client` else)                                              |
| Home rails shape          | `customizations` in the instance config (`instanceConfigs.ts`)                  | see `TV_SURFACE_SPEC.md` §"Proposed THC home"                                                        |

## 2. Env scaffold (starter — copy into the future cust-app-thc `.env`)

```
# Identity
EXPO_PUBLIC_APP_NAME='Thunder Hill Cinema'
EXPO_PUBLIC_APP_SLUG=thunderhillcinema
EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER=com.thunderhillcinema.tv
EXPO_PUBLIC_ANDROID_PACKAGE=com.thunderhillcinema.tv

# Primary instance — ⛔ PLACEHOLDER. Until pt-knife is deployed, either leave
# unset (multi-instance landing, aggregator ethos) or point at a stand-in
# existing instance to demo single-instance UX:
# EXPO_PUBLIC_PRIMARY_BACKEND=peertube.uno
EXPO_PUBLIC_PRIMARY_BACKEND=

# Deploy at domain root (served behind cloudflared), not /web-client
EXPO_PUBLIC_BASE_URL=/

# ⛔ Brand assets — add when THC art exists:
# EXPO_PUBLIC_ICON=./assets/thc/icon.png
# EXPO_PUBLIC_SPLASH_IMAGE=./assets/thc/splash.png
# EXPO_PUBLIC_SPLASH_BG_COLOR=#F95F1E
# EXPO_PUBLIC_ANDROID_TV_BANNER=./assets/thc/android-tv-banner.png
# EXPO_PUBLIC_APPLE_TV_TOP_SHELF=./assets/thc/topShelf_1920x720.png
```

## 3. Curated starter instances (probed 2026-08-25 — reachable, with catalogs)

For the aggregator list / landing screen. THC to CURATE which of these to feature
(this is a taste call — I probed, you pick). All returned live catalogs:

| Instance            | Name                | Local videos | Note                                                 |
| ------------------- | ------------------- | ------------ | ---------------------------------------------------- |
| `peertube.uno`      | PeerTube Uno Italia | 7,850        | has a dedicated **cinema** channel / "Film Completi" |
| `makertube.net`     | MakerTube           | 31,756       | makers / artists / DIY                               |
| `spectra.video`     | Spectra Video       | 10,210       | general/large                                        |
| `video.ploud.fr`    | Ploud Video France  | 13,152       | general/large (FR)                                   |
| `kolektiva.media`   | kolektiva.media     | 8,295        | activist / documentary                               |
| `tilvids.com`       | TILvids             | 3,017        | educational                                          |
| `video.blender.org` | Blender Video       | 1,130        | Blender films/tutorials (an OwnTube demo instance)   |
| `framatube.org`     | Framatube           | 933          | Framasoft (FR)                                       |
| `peertube.tv`       | PeerTube.TV         | 703          | general                                              |

(`diode.zone` was unreachable at probe time.) Discovery beyond this list is built
in: OwnTube can browse `instances.joinpeertube.org` (≤1000 instances) and
SepiaSearch spans the federation.

## 4. ⛔ The three blockers on a _finished_ Step b

1. **No THC primary backend** — pt-knife isn't deployed, so `PRIMARY_BACKEND` has
   no THC host. Options until then: leave unset (aggregator landing), or set a
   stand-in existing instance to demo the branded single-instance UX.
2. **No THC brand assets** — logo, splash, exact palette, and TV art (top-shelf,
   banner) are THC's to provide. Everything above is wired to accept them.
3. **Can't verify render without a TV build** — needs a tvOS/Android-TV simulator
   (Mac + Xcode 16.4 per the fork's CLAUDE.md). Web preview is the other option
   but that path is currently paused.

## 5. What's NOT blocked (doable the moment inputs arrive)

- Drop THC assets into `assets/thc/`, fill the env scaffold → branded build.
- Pick the featured instances from §3 → landing/aggregator list.
- Override `theme/colors.ts` scale with THC palette → app-wide recolor.
- None of this needs `.tv.tsx` edits — it's the thin path (`TV_SURFACE_SPEC.md`).
