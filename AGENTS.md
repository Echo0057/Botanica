# Botanica — AGENTS.md

Project instructions for AI coding agents working in this repository.

## What this project is

**Botanica** is a **local-only, single-user gardening plant database web app** for naturalistic gardens in the Jiangsu / Zhejiang / Shanghai region (江浙沪).

It converts a curated Excel plant list into a browsable web database that supports images, search, filtering, favorites, and "design palette" (plant pairing / planting schemes). It is built for use on one machine only — **no online deployment, no cloud, no cross-device sync**.

Project and app name: **Botanica**.

## Tech stack (phase 1 target)

- **React + Vite** (pure frontend, no backend).
- Data: a static data module, `src/data/plants.json`, loaded at startup.
- Images: local files under `public/images/`, referenced by filename.
- User data (favorites / saved designs): browser `localStorage`.
- Styling: Tailwind CSS is the preferred option (not yet set up).

Run locally with:

```bash
npm install
npm run dev
```

## Data source

- Original Excel: `适合江浙沪的自然主义花园植物目录.xlsx`
  - on this machine at `/Users/echo/Documents/适合江浙沪的自然主义花园植物目录.xlsx`
- The workbook has **9 sheets**, each of which is a "design layer" (设计层):
  1. `常绿乔木` Evergreen trees
  2. `常绿灌木` Evergreen shrubs
  3. `落叶乔木` Deciduous trees
  4. `落叶灌木` Deciduous shrubs
  5. `喜阳灌木宿根` Sun-loving shrubs & perennials
  6. `耐阴宿根` Shade-tolerant perennials
  7. `观赏草` Ornamental grasses
  8. `球根根茎类` Bulbs & rhizomes
  9. `匍匐攀援类` Groundcovers & climbers

These layers are the primary grouping for plant pairing / design palettes.

### Excel columns

A = APG IV genus(属) · B = species(种) · C = cultivar/subspecies/variety(品种) · D = Latin name(学名) · E = APG IV order(目) · F = APG IV family(科) · G = alias/notes(别名/备注) · H = characteristics(特性).

### Known data-quality issues to handle when importing

- **Continuation rows**: many cultivar rows leave genus/order/family blank and inherit them from the row above. The import script must carry these forward.
- **Genus-level records**: some Latin names are genus-only (e.g. `Salvia`, `Laurus`), meaning the whole genus is usable — flag this clearly.
- **Missing Latin names**: ~49 rows have genus/species info but no Latin name — mark them as "学名待核对" (name needs verification).
- **Free-text characteristics**: `特性` is unstructured; extracting structured fields (sun, water, height, bloom season, flower color, reliability/可靠度) enables filtering.
- **No images or size/bloom data yet** — these are the main enrichment targets.

### Reference databases for enrichment / verification

- Missouri Botanical Garden · Plant Finder (filter/UI inspiration)
- RHS Find a Plant (name/cultivar authority)
- Great Plant Picks (reliable/"proven performer" concept)
- Mount Cuba Center (perennial trial results)
- KEW Plants of the World Online (POWO) (taxonomy / APG alignment)
- Images: Wikimedia Commons, iNaturalist, GBIF (mostly CC-licensed), plus owner photos.

## Data model (per plant record)

`id` · `designLayer` · `chineseName` · `latinName` · `genus` · `family` · `order` · `aliases` · `evergreen` (evergreen/deciduous) · `height` · `spread` · `sun` (full sun / part shade / shade) · `water` (dry / medium / wet) · `bloomSeason` · `flowerColor` · `seasonOfInterest` · `fragrance` · `reliability` (from characteristics) · `rawNotes` (original 特性 text) · `images[]` · `tags[]`.

## File naming / content conventions

- **All Markdown filenames use English** (e.g. `plant-database-design.md`), even if the body content is in Chinese. Do not introduce non-ASCII filenames.
- Design proposal: see `design.md`.
- Keep project documentation in Markdown; use English filenames.

## Working conventions

- Keep the first version intentionally minimal: browse the 9 layers, search by name, filter by design layer / sun / evergreen, plant detail + images, and favorites.
- "Design palette / pairing" is phase 2: group selected plants by design layer and add a bloom-season continuity check.
- Prefer a pure-frontend approach. Do not add a backend or SQLite unless the user explicitly asks.
- The `plants.json` data file is generated from the Excel; write/keep an import script (e.g. `scripts/import-excel.mjs`) alongside it rather than hand-editing the JSON for bulk changes.
  - Plants not in the Excel go into `scripts/additional-plants.json` (required: `chineseName` + `category`); run `npm run import:plants` to validate, merge, and regenerate `plants.json`.
  - Follow `PLANT-DATA-SOP.md` for the "add a new plant" and "search overseas databases to enrich characteristics" workflow. Record source URLs in each entry's `sources` array.

## Git workflow

- **Autonomously commit** any substantial/complete change once it is done and verified (e.g. `git add -A && git commit -m "..."`). No need to ask first.
- **Do not push to remote proactively.** Leave pushing to the user (`git push` only when the user asks).
- Keep commits focused and descriptive; commit before handing off a finished piece of work.
