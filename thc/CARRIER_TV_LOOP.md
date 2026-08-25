# The Carrier ↔ TV Loop — one video, three surfaces

How a THC post reaches the couch with **no new infrastructure**, proven against a
real production artifact: the single PeerTube post on a THC tenant subdomain,
drawing from `video.blender.org`.

## The insight

The `carrier` field (THC platform, `/work` — `Post.derive_carrier/1`) stores the
**same `{instance, video_id}` coordinates** that every consumer keys on. It just
makes them _first-class_ (stored once at write time) instead of re-sniffed from the
URL on every render. Those coordinates are the bridge between the platform and the
TV client — they are literally OwnTube's `backend` + `id`.

## One video, three surfaces (all verified 2026-08-25)

Real Blender video — "FASTER Blender! ⚡️ Blender Today LIVE #287",
short id `dsziDLME4nQwbDANGirroE`:

| Surface                                         | URL it keys on                                                     | Verified                                           |
| ----------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| **THC post** (author pastes)                    | `https://video.blender.org/w/dsziDLME4nQwbDANGirroE`               | → carrier `peertube` / `https://video.blender.org` |
| **Existing THC `/tv`** (`tv_watch_live.ex:230`) | `https://video.blender.org/videos/embed/<id>`                      | HTTP 200                                           |
| **OwnTube couch** (deep-link)                   | `/video?backend=video.blender.org&id=<id>` → `/api/v1/videos/<id>` | resolves, 2 HLS files, playable                    |

Same instance, same id, three renderers. The carrier field is the one place that
now names them as data.

## The mapping (one small transform)

- THC `carrier_instance` carries the **scheme**: `https://video.blender.org`.
- OwnTube `backend` is **host-only**: `video.blender.org`.
- OwnTube deep-link = `/video?backend=` + `host(carrier_instance)` + `&id=` +
  the video id (`external_video_id`, or parsed from `content` via
  `PostHelpers.extract_peertube_video_id/1`, whose `%{instance, video_id}` is the
  exact shape `carrier` derives from).

So a THC → OwnTube deep-link is a pure function of the carrier fields. Building
that helper is the natural next code step — deferred only because there is no THC
OwnTube deployment to point `backend`-less relative links at yet (see
`BRANDING.md` blocker #1).

## Why this matters

- **No new bytes, no new infra.** THC already consumes Blender's PeerTube; OwnTube
  already browses Blender; the carrier field makes the handoff explicit. The whole
  aggregator loop is real _today_, on one production row.
- **It's the thin path made concrete.** When THC publishes its OWN content to
  pt-knife (Phase 1 publish pipeline), those posts get `carrier: peertube` +
  `carrier_instance: <thc host>` by the same `derive_carrier/1`, and the same
  deep-link maps them onto the couch — no per-surface work.

## Status

- Carrier write path + tenant-aware backfill: BUILT in `/work` (slice 2, TDD
  green) — `Post.derive_carrier/1` (shared), `put_carrier/1` in create + draft +
  co-creator changesets, `Posts.backfill_carriers/0`. Run the backfill under
  `TenantRegistry.with_tenant_repo(venue_id, &Posts.backfill_carriers/0)` to stamp
  the Blender post in its tenant DB.
- THC → OwnTube deep-link helper: NOT built (waiting on a THC OwnTube deployment).
