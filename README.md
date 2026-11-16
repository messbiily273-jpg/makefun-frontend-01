# Pitlane — a fast make.fun frontend

A fully working web client for [make.fun](https://make.fun), made of static
files, that reads make.fun's public API and is fast to load, light at run
time and easy to use. No framework, no build step, no third-party code, no
sign-in, no tracking.

## Surfaces

- `#/` — the live bounty board: each bounty's reward as its live pot, its
  entry fee, its time left and its entries, with type-to-filter search and
  sorting (closing soonest, biggest pot, most entries, newest).
- `#/bounty/<slug>` — a bounty's page: summary, live rewards table with the
  pot split, entry fee, dates, status and rules.
- `#/bounty/<slug>/leaderboard` — the bounty's leaderboard: rank, entrant,
  judge win rate with its 90% interval, W/D/L, prize place and dossier size,
  25 rows a page.
- `#/u/<handle>` — an account's public profile: avatar, links, record and
  entries.

Every surface is reachable by a link and by its own URL (hash routes).

## Why it is fast

- First load is a handful of tiny files: one HTML page, one stylesheet, four
  small ES modules, system fonts, no images.
- API answers are cached in memory for a minute and revalidated with
  `If-None-Match` after that, so a repeat read costs a 304 with no body.
- One API request per view; search, sort and paging happen client-side.
- Leaderboards page 25 rows at a time; avatars load lazily.

## Run it

```sh
node serve.ts        # app/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`
library, byte for byte the scorer's own copy.

## License

MIT. See LICENSE.
