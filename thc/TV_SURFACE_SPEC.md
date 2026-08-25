# THC TV Surface Spec — the couch experience we want

What THC's TV app should be, on top of OwnTube's shipped surface
(`thc/TV_UI_MAP.md`). Grounded in two inputs: OwnTube's actual TV code, and the
10-foot / streaming-UX conventions the big players converged on. Status:
**proposal / decision doc — nothing built.**

## North star

**Lead with curation, not primitives.** OwnTube's home rails are _structural_
(Latest / Channels / Categories = raw PeerTube objects). THC's entire
differentiator is _curation_ — compilations, venues/cinemas, Red Carpet taste,
live premieres. The couch app should feel like walking into a cinema someone
programmed, not a file browser of an instance. This is also what the streaming
research says users expect: a **hero/spotlight up top, then editorial/personalized
shelves** — not an undifferentiated grid.

## Streaming conventions we're measuring against (cited)

- **Hero unit at top + card rows/shelves below**, personalized/editorial rows
  first (Netflix pattern).
- **Focus is the whole interaction** — no cursor; every focus change needs an
  unmistakable cue: scale ~1.05–1.1×, elevation/shadow, and ideally an audio tick;
  body type readable at ~3m.
- **Dynamic Top Shelf** (tvOS): deep-linked, frequently-refreshed featured content
  — _not_ a static banner; each item opens its own content.
- Apple TV leans **editorial/lean** over exhaustive; that suits THC's curated posture.

Sources: [Smashing — Designing for TV](https://www.smashingmagazine.com/2025/09/designing-tv-principles-patterns-practical-guidance/),
[Apple tvOS HIG — Focus & Top Shelf](https://developers.apple.com/design/human-interface-guidelines/tvos/overview/themes/),
[Streaming UX best practices](https://www.forasoft.com/blog/article/streaming-app-ux-best-practices).

## Gap analysis — OwnTube today vs. the conventions

| Convention                             | OwnTube ships                                                                                        | Gap / THC opportunity                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hero/spotlight at top                  | ❌ home opens straight into rails                                                                    | Add a hero row: THC premiere / live / featured cinema   |
| Editorial/personalized rows first      | ❌ structural rows (Latest/Channels/Cats)                                                            | THC curation rows (below)                               |
| Focus cue = scale + elevation          | ~ border-only on cards (`Picker.tv`, `TvKeyboard`); scale only on player buttons (`INTERFACE_SCALE`) | Add scale/elevation on poster cards                     |
| Dynamic Top Shelf (deep-linked, fresh) | ❌ static `topShelf` image asset only (`app.config.ts:79`)                                           | `TVTopShelfContentProvider` fed by THC featured content |
| Auto-play preview on focus             | ❌                                                                                                   | Optional, later — bandwidth/again design call           |

## THC domain → TV rails (the mapping that decides thin vs. thick)

The lever is: **does the THC structure map to a PeerTube primitive?** If yes, we
publish it as that primitive and vanilla OwnTube renders it as a rail **for free**
(the spine's "style our curation, don't build an app" thesis). If no, it's net-new
`.tv.tsx` + a THC API call.

| THC structure                      | PeerTube primitive        | Path                                                 | Effort                                                             |
| ---------------------------------- | ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Compilation / print (curated reel) | **Playlist**              | Publish pipeline → playlist → renders as a home rail | THIN (config + Phase 1 publish)                                    |
| Venue / cinema / creator           | **Channel**               | Publish → channel → "Channels" rail + channel page   | THIN                                                               |
| Live premiere / broadcast          | **Live video** (`isLive`) | Already a home rail (`HomeScreen:55-76`)             | THIN (needs THC live → PeerTube live)                              |
| Category / genre                   | **Category**              | Native rail                                          | THIN                                                               |
| **Red Carpet / taste feed**        | _(none)_                  | Net-new rail pulling a THC-curated ordering          | THICK (`.tv.tsx` + THC API, or a synthesized "editorial" playlist) |
| **Hero / spotlight**               | _(none native)_           | Net-new hero row component                           | THICK                                                              |
| **Dynamic Top Shelf**              | _(none)_                  | `TVTopShelfContentProvider` (tvOS native)            | THICK                                                              |

**Consequence:** most of THC's catalog reaches the couch as _thin_ config the
moment the Phase 1 publish pipeline emits playlists/channels. The genuinely
net-new couch work is exactly three things: **hero row, a curated "Red Carpet"
editorial rail, and a dynamic Top Shelf.** Everything else is data.

## Proposed THC home (couch), top to bottom

1. **Hero / Now Showing** — one big deep-linked spotlight (today's premiere, or a
   live broadcast if one is on). _(thick — hero component)_
2. **Live now** — THC livestreams. _(thin — existing live rail, once THC live
   publishes as PeerTube live)_
3. **Red Carpet picks** — THC's curated/taste ordering. _(thick, or thin if we
   synthesize it as an auto-maintained playlist)_
4. **Compilations / Reels** — curated playlists. _(thin — publish pipeline)_
5. **Cinemas / Venues** — channels. _(thin)_
6. **Recently watched → Categories** — native tail. _(thin)_

## Focus & feel (small, high-leverage polish)

- Poster cards get a **focused scale ~1.08× + elevation**, matching the streaming
  standard (OwnTube's cards are border-only today). One shared change to the
  `VideoGridCard` focused style.
- Keep OwnTube's player as-is — it already meets convention (long-press scrub,
  `hasTVPreferredFocus`, tvOS 3× scale). Re-skin to THC theme tokens only.

## Open decisions for THC (need a human call)

1. **Red Carpet on the couch: thick or synthesized-thin?** Build a net-new
   `.tv.tsx` rail against a THC endpoint, OR have THC maintain a "Red Carpet"
   PeerTube playlist that vanilla renders. Synthesized-thin is far cheaper and
   keeps us on the thin path; it loses per-viewer personalization (a playlist is
   one ordering for everyone). **Recommendation: start synthesized-thin.**
2. **Hero row** — worth the first net-new `.tv.tsx`, or defer and open on rails
   only (Apple-TV-lean style)? **Recommendation: defer to v2; ship rails first.**
3. **Top Shelf** — v1 static THC art vs. v2 dynamic provider. **Recommendation:
   static art v1, dynamic later.**
4. Multi-instance vs. single-instance: THC as sole `PRIMARY_BACKEND` (branded,
   store-review-friendly) vs. keep the instance switcher (aggregator ethos). The
   spine says keep aggregation ON — so likely **primary THC + switcher retained**.

## What this means for sequencing

- **Thin wins first.** The moment Phase 1 publishes THC compilations→playlists and
  venues→channels, the couch home fills with real THC curation via config alone.
- **Net-new is small and deferrable** (hero, Top Shelf, a personalized rail) — none
  blocks a shippable, on-brand THC TV app.
- Immediate next step (Step **b**): brand + point the vanilla client at a THC
  primary backend and shape `featured-instances.json5` — proves the thin path on
  the couch before any `.tv.tsx` work.
