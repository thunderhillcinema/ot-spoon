# PeerTube Carrier — Spine

Status: **decision record + roadmap. Nothing built yet.** (2026-08-24; OwnTube
`web-client` source read + both gating questions resolved 2026-08-25 — see §5.)

This directory is the spine for making **PeerTube a first-class content carrier**
for Thunderhill Cinema, and for the TV / multi-platform clients that ride on it.
It sits at the repo root alongside the other non-Elixir sibling projects
(`ios/`, `extension/`, `scanner/`, `federation/`).

---

## 1. Why — the decision trail

We did not arrive here from hype. Each step had no escape hatch:

1. **TV is the forcing function.** Getting a real living-room presence means an
   app that _plays_ video. YouTube cannot be played inside a third-party TV app:
   their ToS forbids it, the native Android Player API is deprecated, and generic
   WebViews block YouTube embeds. There is **no compliant workaround** — the only
   thing that plays on every TV is **HLS you serve yourself**.
2. **Owning HLS ⇒ hosting video.** Aggregating links (YouTube/Vimeo) can never
   satisfy TV; only first-party-hosted, HLS-deliverable content can.
3. **PeerTube is the federation-aligned way to host it.** It fits the entire THC
   thesis (own-your-content, self-hostable, federated), we already consume it as a
   first-class provider (`extract_peertube_video_id`, `@peertube/embed-api`, the TV
   iframe branch), and we already run HLS ops via MediaMTX for livestream.

**Therefore: PeerTube becomes the carrier.** It stops being "one provider we
embed" and becomes the origin the platform is built around.

---

## 2. The OwnTube.tv ecosystem — the adopted spine

[OwnTube.tv](https://github.com/OwnTube-tv) is a 2024 effort that is almost
exactly this initiative, and **licensed under the Unlicense (public domain)** — no
legal friction to forking/rebranding/shipping.

| OwnTube repo                    | What it is                                                       | Role for us                                        |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `web-client`                    | Portable PeerTube client in **React Native + Expo + TypeScript** | The clients (mobile / TV / web) from ~one codebase |
| `cust-app-template`             | Template to spin up a **branded app on your own instance**       | The documented path to a **THC-branded** app       |
| `cust-app-blender`              | Real worked example ("Blender Tube")                             | Proof the branding path works end-to-end           |
| `PeerTube` (fork)               | The ActivityPub video platform                                   | Candidate host                                     |
| `peertube-runner`               | Kubernetes transcoding                                           | Transcode tier                                     |
| `minio-*-ansible`               | S3 storage infra                                                 | Storage tier                                       |
| `peertube-plugin-premium-users` | Stripe memberships                                               | Billing tier                                       |

**The realization:** OwnTube is not just a TV client — it is a near-complete
reference architecture for running a _branded, hosted, federated PeerTube platform
with clients_. We went looking for a TV app and found a blueprint for the whole
carrier.

**Calibration (honest):** `web-client` is young (~9★). Adopting it means **fork
and co-own**, not "install a finished product." Still a massive head start over
building five TV UIs from scratch, and the customization architecture is
purpose-built for what we want.

---

## 3. Architecture decisions (hard rules carried from the design conversation)

- **Federation stays LINK-OUT for video.** Host our own originals; let peers embed
  _from_ us; **do NOT enable PeerTube's cross-instance video mirroring/redundancy.**
  That preserves the "we never host another instance's bytes" shield the rest of
  THC's federation already maintains (shadow venues, federated cards, snapshots are
  all display-only / link-out). Turning on mirroring inherits peers' moderation
  liability — the Fediverse-admin nightmare.
- **Aggregation and mirroring are DIFFERENT axes — keep aggregation ON.** "We
  never host another instance's bytes" (mirroring, off) does not mean "we only
  show our own instance." THC stays an **aggregator**: it plays PeerTube content
  hosted on instances we do NOT run, streamed HLS-direct from their origin — the
  exact stance the existing `/tv` integration already models. Our own PeerTube
  instance is an _additional_, deeper sphere, not a replacement. OwnTube supports
  this natively: every route carries a `backend` param and queries
  `https://<backend>/api/v1`, and it can browse up to 1000 instances from
  `instances.joinpeertube.org` (`api/instanceSearchApi.ts`). The fork's job is to
  make branded-THC-primary and cross-instance-browse **coexist**, not pick one.
- **TV is a lean-back catalog, not the Red Carpet swipe.** The existing `/tv` is a
  lean-forward feed (a phone gesture on a TV). The couch wants rails of posters +
  browse-then-play. OwnTube's client _is_ that idiom.
- **Publish THC curation INTO PeerTube as channels/playlists.** The more our
  compilations/venue-programming/taste materialize as PeerTube structures, the more
  an off-the-shelf client surfaces our curation **for free** — style data, not build
  an app.
- **Moderation splits into TWO tiers** once we host bytes:
  - _Custodial_ (NEW, mandatory, at-ingest, mostly automated): CSAM
    scan-at-ingest + NCMEC reporting, DMCA agent + notice-and-takedown. **Gates
    PUBLIC upload** — not the whole project; trusted/invited originals can flow
    earlier.
  - _Curatorial_ (EXISTING): film lab / community standards / `ContentPolicy` /
    family mode. Sits on top of the custodial floor.
  - Transferable assets we already have: `scanner/`, the film-lab apparatus,
    `ContentPolicy` fail-closed gates, MediaMTX HLS ops.
- **The existing `/tv` LiveView + TV-web-browser access stays** as the hidden
  baseline (works today; the QR-pairing + phone `/remote` solves TV text input).
  The OwnTube clients are the promoted, streamlined experience.

---

## 4. Platform coverage plan

| Platform                               | Path                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Android TV / Fire TV / Apple TV (tvOS) | OwnTube RN/Expo native builds _(verify TV targets are wired)_                                                  |
| iOS / Android phone                    | OwnTube RN/Expo native builds                                                                                  |
| Web / PWA                              | OwnTube Expo **web** build                                                                                     |
| Samsung Tizen / LG webOS               | Package the OwnTube web build (like we package the LiveView app) _(verify feasible)_, else TV-browser fallback |
| Roku                                   | [PeerVue](https://github.com/) (separate OSS client) or defer                                                  |
| Any smart-TV browser                   | Existing `/tv` LiveView — hidden baseline                                                                      |

---

## 5. Open questions

### Resolved by reading the `web-client` source (2026-08-25)

1. **TV targets — CONFIRMED, first-class.** Not "implied": the whole app runs on
   the tvOS RN fork (`react-native: npm:react-native-tvos@0.76.9-0` in
   `package.json`); `@react-native-tvos/config-tv` is wired with Android TV banner
   - the full Apple TV image/top-shelf set, gated on `EXPO_TV` (`app.config.ts`);
     there are **8 `.tv.tsx` platform-specific components** (TV player-controls
     overlay, device-capabilities, D-pad pickers); and the CI pipeline
     (`docs/pipeline.md` → `deploy-static-main.yml`) builds **iOS + tvOS simulators,
     Android + Android TV APKs**, with optional **TestFlight / Google Play** upload
     jobs. Cast/playback stack is complete: `react-native-video` (native HLS),
     `video.js` (web HLS), `react-native-google-cast`, `react-native-airplay-button`.
2. **Expo web → Tizen/webOS — PARTIAL.** Web is a **static export**
   (`web.output: "static"`, deployed to GitHub Pages). That bundle is the right raw
   material for a Tizen/webOS package, but the pipeline ships **no Tizen/webOS
   packaging step** — that stays net-new work (same "package the static app"
   pattern noted in §4). Smart-TV browser + the existing `/tv` LiveView remain the
   fallback for those two platforms.

Adjacent facts confirmed in the same read (not originally open questions, but they
de-risk the fork): license is **Unlicense / public domain** (`LICENSE`); auth
exists (`api/authApi.ts` + OTP + username/password, `loginWithUsernameAndPassword`
flag) so member/premium flows are reachable; and customization is **data, not
code** — `instanceConfigs.ts` (Zod-validated) drives home layout, menu, playlists,
featured lives, external links, injected at build via
`CLIENT_CUSTOMIZATIONS_REPO`/`_FILE`. That last one is the "style our curation,
don't build an app" lever: our compilations/venues/taste published as PeerTube
channels/playlists surface for free.

### Still open

3. **Integration structure — DECIDED (2026-08-25): TWO separate repos, not
   vendored, named.** The split is forced (not preference): the client is
   Unlicense RN/Expo/TS shipping to app stores; the instance is AGPL server infra
   deployed to boxes — different license, toolchain, cadence, and `upstream`. Same
   pattern as the `opentogethertube` fork (org `thunderhillcinema`, `origin` +
   an `upstream` remote for tracking; note the working-dir name differs from the
   GitHub repo name — `ott-fork` locally vs `opentogethertube` on GitHub).

   - **`ot-spoon`** — the OwnTube client fork (TV / mobile / web), `upstream =
OwnTube-tv/web-client`. Unlicense. ("spoon" = a rebrand-fork, following the
     `ott-fork` naming line.)
   - **`pt-knife`** — the PeerTube instance, `upstream = Chocobozzz/PeerTube` (or
     OwnTube's PeerTube fork). AGPL. Holds a PeerTube fork + our deploy/config +
     the forked `premium-users` plugin. Open sub-decision: how much it modifies
     core vs. rides vanilla with config on top (the transcode/storage tiers may
     later split into their own repos, mirroring OwnTube).

   This `owntube/` dir stays as the **spine doc + the Elixir-side publish
   pipeline**. Open: exact GitHub repo strings under the org; whether the spine doc
   later migrates to `ot-spoon`.

4. **The publish pipeline is the biggest net-new Elixir work:** how THC content gets
   into PeerTube (transcode → store → HLS), and the first-class "hosted-on-our-
   PeerTube" data model (a real provider/origin field instead of URL-sniffing).

---

## 6. Phased roadmap

- **Phase 0 — Host.** Stand up a THC PeerTube instance; evaluate OwnTube's PeerTube
  fork + `peertube-runner` + storage vs. a vanilla instance against our MediaMTX ops.
- **Phase 1 — Publish pipeline.** THC content → PeerTube (transcode/store/HLS).
  Introduce the first-class carrier field on posts (provider/origin), replacing
  URL-derived provider detection. This is where the "first-class carrier" becomes
  real in the data model.
- **Phase 2 — Client.** Fork `web-client` via `cust-app-template`, brand it THC,
  point it at the instance; get the **TV target** running first (the whole reason
  we're here). Curation → channels/playlists so the catalog reflects our taste.
- **Phase 3 — Moderation floor.** Ingest CSAM scan + DMCA agent + takedown, before
  opening PUBLIC upload. Extend `scanner/` from URL-scanning to file-at-ingest.
- **Phase 4 — Packaging & reach.** Tizen/webOS packages, Roku (PeerVue), store
  presence, per-platform certification.

---

## 7. What is NOT changing

- No cross-tenant content migration; the existing federation link-out stance holds.
- **Aggregation is unchanged and stays ON** (see §3). PeerTube content hosted on
  instances we do NOT run keeps flowing through, HLS-direct from its origin — on
  the TV clients too, because it is exactly what TV can play. What "we host bytes"
  adds is a second, deeper sphere (our own instance), not a narrowing to it.
- **Non-HLS providers (YouTube/Vimeo) are unaffected but stay off TV.** They
  remain on the phone/web Red Carpet; they simply cannot appear on the
  PeerTube-carrier TV clients, since a TV app cannot legally/technically play them
  (this is the §1 forcing function, not an aggregation choice).
- Money/billing authority rules from the rest of the platform are untouched here.
