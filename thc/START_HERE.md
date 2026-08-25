# START HERE — PeerTube Carrier initiative (agent onboarding)

**New to this? Read this file top to bottom, then `README.md` (the spine) in this
folder for the full reasoning + roadmap.** A project memory
(`peertube-carrier-owntube-spine.md`, loaded via `MEMORY.md`) has the compressed
version. This file exists so you don't have to reconstruct the design conversation.

---

## In one paragraph

**PeerTube is becoming THC's first-class video carrier.** The forcing function was
TV: YouTube cannot be played in a third-party TV app (ToS + dead native API +
WebView blocks), so a real living-room presence requires **HLS we host ourselves**,
and PeerTube is the federation-aligned way to own that. We are adopting the
**OwnTube.tv** ecosystem (Unlicense/public-domain) as the spine — its `web-client`
(React Native/Expo) for multi-platform + TV clients, and its PeerTube fork /
transcoder / storage / billing repos as a reference architecture for the host.

---

## Current state (as of 2026-08-25)

- **EXISTS:** this folder, `README.md` (the spine / decision record + roadmap), the
  structural decision (separate repo — see below), a project memory, and a
  **completed source read of `OwnTube-tv/web-client`** (spine §5 — both gating
  questions resolved).
- **DOES NOT EXIST:** any code, any forked repo, any PeerTube instance. **Nothing is
  built.** No RED test was written. This is still planning → first steps.

## Gating questions — ANSWERED (2026-08-25, see spine §5)

- **TV targets are real and first-class**, not implied: whole app on the
  `react-native-tvos` fork, `config-tv` wired, 8 `.tv.tsx` components, CI builds
  Android TV + tvOS with TestFlight/Play upload jobs. → fork buys the living room.
- **Web is a static export; Tizen/webOS packaging is NOT provided** — that step
  stays net-new work; smart-TV browser + existing `/tv` remain the fallback there.
- **Aggregator confirmed native:** `backend` route param + `instances.joinpeertube.org`
  search (up to 1000 instances). THC stays an aggregator of PeerTube it does NOT
  host; our own instance is an *additional* deeper sphere. Keep both — do not
  narrow to own-instance-only.

## Your likely first tasks (confirm which with the user before diving in)

1. **Fork `OwnTube-tv/web-client` → `ot-spoon`** in the `thunderhillcinema` org,
   `upstream = OwnTube-tv/web-client` for tracking. ⚠️ **OUTWARD action — needs
   explicit user go.** Do not create/push repos unprompted. (Sibling repo
   **`pt-knife`** = the PeerTube instance, `upstream = Chocobozzz/PeerTube`, stood up
   in Phase 0 — see spine §5.3. Two repos, forced by the Unlicense-vs-AGPL +
   toolchain boundary; names follow the `ott-fork` line.)
2. **(Later — Phase 1, biggest net-new work)** the **Elixir publish pipeline**: THC
   content → PeerTube (transcode/store/HLS) + a first-class carrier/provider field on
   posts. This lives in THIS repo; the rest lives in the new client/infra repos.

---

## LICENSING — the two-license boundary (VERIFIED 2026-08-25)

The two-repo split is not tidiness; it is a **license firewall**. Get this wrong
and either `ot-spoon` is contaminated or a public `pt-knife` violates AGPL.

- **`ot-spoon` = Unlicense (public domain).** OwnTube `web-client` is Unlicense
  (`LICENSE` in the repo). It talks to PeerTube **only over the documented HTTP
  REST API**.
- **`pt-knife` = PeerTube = AGPL-3.0-or-later.** Verified against
  `Chocobozzz/PeerTube/LICENSE` (SPDX `AGPL-3.0-or-later`).

### What AGPL means for modifying PeerTube

- **AGPL's distinguishing clause is §13 (network use).** Plain GPL triggers only on
  *distributing a binary*; AGPL adds: **running a MODIFIED version on a server that
  users reach over a network counts as distribution.** PeerTube is exactly that, so
  §13 is live the moment we run a modified public instance.
- **You may modify PeerTube freely** — any purpose, commercial included — and owe
  nothing while it's **private/internal**. Obligation attaches only when users can
  reach the modified version.
- **Once `pt-knife` is public AND modified, you owe three things:** (1) **publish the
  Corresponding Source** of the modified PeerTube to the instance's users (AGPL's
  "prominent offer" — a source link in the UI/footer; a public `pt-knife` that
  matches the deployed build satisfies it); (2) **license those core modifications
  AGPL-3.0-or-later** (can't be made proprietary while served); (3) **keep
  notices + state your changes.** You owe the *code* only — not content, users, or
  business model.

### The firewall — where AGPL stops

- **The REST API is the license boundary.** A separate program communicating with
  AGPL software at arm's length over a network API is **NOT a derivative work** and
  does **NOT** inherit AGPL. That is *why* OwnTube's client is Unlicense against an
  AGPL backend — we inherit the same clean line. **Keep `ot-spoon` behind the API;
  never pull PeerTube source into it** (AGPL→Unlicense relicensing is a violation,
  and the incompatibility is one-directional).
- **Infra/config is generally NOT a derivative work.** docker-compose, ansible, k8s,
  nginx/traefik, `.env` don't incorporate PeerTube source → can be private/any
  license. **Practical rule: keep `pt-knife` THIN — vanilla PeerTube + our config on
  top, modify core only when forced.** Less core touched = less AGPL surface to
  publish.

### Two adjacent traps

- **Plugins are legally unsettled.** Whether a plugin binding PeerTube's internal
  APIs is a derivative (⇒ must be AGPL) is the classic plugin-linking grey area.
  Conservative practice (and what most PeerTube plugins do) = **license plugins
  AGPL-3.0**. The forked `premium-users` plugin is already AGPL upstream, so no new
  exposure. A config/CSS theme is far safer than a plugin hooking core.
- **Trademark ≠ copyright.** "PeerTube" + logo are **Framasoft trademarks**, governed
  separately from AGPL. Rebranding to THC means removing/replacing PeerTube branding
  per their trademark policy — a distinct obligation. Brand via config, not by
  editing core templates (also keeps AGPL surface low).

**Not legal advice.** For anything load-bearing — the plugin-derivative question, a
commercial/premium tier — confirm with counsel before shipping.

---

## HARD RULES — decided, do NOT violate

- **Separate repo for the client, NOT vendored here.** It's an upstream OSS fork on a
  different toolchain (RN/Expo/TS) with its own release cadence and an
  Unlicense-vs-AGPL boundary. Same pattern as the `opentogethertube` fork
  (`federation/scripts/thc-ctl.sh`). This `owntube/` dir stays = spine doc + the
  Elixir publish pipeline only.
- **Federation stays LINK-OUT for video.** Do **NOT** enable PeerTube's cross-instance
  video mirroring/redundancy — that would make us host peers' bytes and inherit their
  moderation liability, breaking the "we never host others' bytes" shield the rest of
  THC federation maintains.
- **TV = lean-back catalog (OwnTube), not the Red Carpet swipe feed.** The existing
  `/tv` LiveView + TV-web-browser access **stays** as the hidden baseline (works today;
  QR-pairing + phone `/remote` solves TV text input).
- **Two-tier moderation once we host bytes.** Custodial floor (CSAM-scan-at-ingest +
  NCMEC report + DMCA agent) is mandatory and **gates PUBLIC upload only** — trusted/
  invited originals can flow earlier. Curatorial (existing film-lab / `ContentPolicy`)
  sits on top. Extend `scanner/` from URL-scanning to file-at-ingest.

## ABANDONED — do not resurrect

- The **native THC PeerTube-only `/tv` variant**: a new `live_action` on `TVHomeLive`
  + a pure video-provider classifier filtering `Posts.list_filtered_posts`. It was the
  plan for ~20 minutes, then superseded by adopting OwnTube. No code was written.
  Don't rebuild it — the TV client is a separate RN app hitting PeerTube's API.

---

## Existing PeerTube touchpoints in the THC codebase (so you don't re-hunt)

- **Consumption today:** `extract_peertube_video_id/1`
  (`lib/thunderhillcinema_web/controllers/post_helpers.ex:88`); `@peertube/embed-api`
  (`assets/js/hooks/video/plyr_video_player.js`); TV iframe render branches
  (`lib/.../live/tv/tv_watch_live.ex:125–236`, and an inline YouTube embed at
  `tv_home_live.ex:679`).
- **HLS ops already running:** MediaMTX (livestream) — precedent for serving HLS.
- **Provider is URL-DERIVED, no stored column** (posts only carry
  `source_instance_identifier`). Phase 1's carrier field replaces the URL-sniffing.

## The OwnTube ecosystem (already researched — see spine §2 for the table)

- `web-client` — RN/Expo/TS client core to fork (Unlicense).
- `cust-app-template` + `cust-app-blender` — branded-app-on-your-instance path + a
  real worked example ("Blender Tube").
- `PeerTube` fork, `peertube-runner` (k8s transcode), `minio-*` (storage),
  `peertube-plugin-premium-users` (Stripe) — the host stack.
- Roku: **PeerVue** is a separate OSS PeerTube client (RN doesn't target Roku).

## Working norms in this repo (from CLAUDE.md)

- **TDD mandatory** for code (RED → GREEN → refactor). **Do NOT run full `mix test`** —
  targeted tests only; `/red_carpet` LiveView tests OOM (compile first, `--no-compile`).
- **Don't build unagreed decisions.** This is planning-heavy; confirm scope first.
- **Outward/irreversible actions** (repo creation, pushes, deploys) need explicit user
  go. Never `git stash`.

## Pointers

- Full reasoning + roadmap: `owntube/README.md`
- Project memory: `peertube-carrier-owntube-spine.md` (via `MEMORY.md`)
- OwnTube: https://github.com/OwnTube-tv · `web-client` repo (Unlicense)
