# CLAUDE.md – Project Guide for AI Assistants

## Project Overview

**CSTS** is a fan-made SvelteKit web application that scrapes, processes, and displays competition results from the Czech Dance Sport Federation API (`https://www.csts.cz/api/1/`). It has no ads and no login. It uses PostgreSQL (via Docker) with Drizzle ORM and pg-boss for scheduled background jobs.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | SvelteKit | `^2.50.2` |
| UI layer | Svelte | `^5.49.2` |
| Language | TypeScript | `^5.9.3` |
| Build tool | Vite | `^7.3.1` |
| Database | PostgreSQL (Docker) | see `compose.yaml` |
| ORM | Drizzle ORM | `^0.45.1` |
| ORM CLI | drizzle-kit | `^0.31.8` |
| DB driver | postgres (pg) | `^3.4.8` |
| Job Scheduler | pg-boss | `^12.13.0` |
| Script runner | tsx | `^4.21.0` |
| Env vars | dotenv | `^17.3.1` |
| SvelteKit adapter | @sveltejs/adapter-auto | `^7.0.0` |
| Package Manager | pnpm | (workspace) |

---

## Styles

The design is a **noble, dark mobile-first UI** (max-width `480px`) inspired by the elegance of competitive ballroom and latin dance. Gold is the primary prestige accent, with a deep midnight navy background.

### Colors (CSS custom properties — defined in `:root` in `src/app.css`)

| CSS Variable               | Value                          | Role |
|----------------------------|--------------------------------|------|
| `--color-gold-accent`      | `#c9a84c`                      | Primary prestige accent — borders, labels, competition titles |
| `--color-gold-light`       | `#e8c97a`                      | Lighter gold — button text, hover states |
| `--color-cyan`             | `#4cc9f0`                      | Brand accent — title gradient tail |
| `--color-blue`             | `#4361ee`                      | Brand accent — button gradient |
| `--color-purple`           | `#7209b7`                      | Tertiary accent |
| `--color-violet`           | `#360145`                      | Deep violet — gradients |
| `--color-deep-navy`        | `#0b0c1a`                      | Background base |
| `--color-dark`             | `#07080f`                      | Background midpoint |
| `--color-surface`          | `#0f1120`                      | Card / panel background |
| `--color-surface-raised`   | `#161929`                      | Elevated card surface |
| `--color-input`            | `#1a1d2e`                      | Select / input background |
| `--color-text`             | `#d4d0c8`                      | Body text (warm off-white) |
| `--color-text-muted`       | `rgba(212, 208, 200, 0.55)`    | Secondary / muted text |
| `--color-text-heading`     | `#ede8dc`                      | Heading text |
| `--color-gold`             | `#d4af37`                      | Gold medal |
| `--color-silver`           | `#a8a9ad`                      | Silver medal |
| `--color-bronze`           | `#b87333`                      | Bronze medal |
| `--color-warning`          | `#e8b84b`                      | Warning / notice |
| `--color-border-subtle`    | `rgba(201, 168, 76, 0.12)`     | Default card/panel border |
| `--color-border-gold`      | `rgba(201, 168, 76, 0.35)`     | Prominent gold border (filter, event header) |

### Fonts

Loaded from Google Fonts via `@import` in `src/app.css`:

| Variable            | Family                                          | Usage |
|---------------------|-------------------------------------------------|-------|
| `--font-heading`    | `'Cormorant Garamond'`, Georgia, serif          | Event titles, competition titles, filter headings, placement numbers |
| `--font-body`       | `'Inter'`, system-ui, sans-serif               | All body text, labels, selects |

- Headings use `font-style: italic`, `font-weight: 700`, `letter-spacing: 0.02em`
- Section labels use `font-size: 0.7rem`, `text-transform: uppercase`, `letter-spacing: 0.18em`
- Metadata uses `font-size: 0.75–0.8rem`, `color: var(--color-text-muted)`

### Theme

- **Mode:** Dark only
- **Mood:** Noble, honorable, elegant — suited to competitive dance sport
- **Layout:** Single-column, centered, `max-width: 480px`
- **Border radius:** `3px–4px` (sharp, refined corners — not bubbly)
- **Background:** Fixed deep midnight gradient `160deg, #0b0c1a → #07080f → #110820`
- **Gradient text:** Main title uses gold → gold-light → cyan gradient via `-webkit-background-clip: text`
- **Borders:** Gold-tinted (`--color-border-gold`) on interactive panels; subtle gold (`--color-border-subtle`) on cards
- **Button style:** Outlined ghost button with gold border and gold text; fills softly on hover
- **Medal cards:** Soft glow `box-shadow` + `inset` shimmer on gold/silver/bronze cards
- **Dividers:** Thin `1px` gold-tinted lines used as section separators (event header bottom border, event-date bottom border)
- **Decorative rule:** `::before` pseudo-element — 48px wide, 2px tall gradient bar above the main title

---

## Key Commands

```bash
# Development
pnpm dev                    # Start SvelteKit dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Database
pnpm db:start               # Start PostgreSQL via docker compose
pnpm db:push                # Push schema changes (no migration file)
pnpm db:generate            # Generate Drizzle migration
pnpm db:migrate             # Run migrations
pnpm db:studio              # Open Drizzle Studio

# Scheduler (pg-boss)
pnpm scheduler              # Start standalone pg-boss scheduler process

# Scraping scripts (run manually or via scheduler)
pnpm scrape:events          # Scrape events from CSTS API
pnpm scrape:competitions    # Scrape competitions
pnpm scrape:results         # Scrape results

# Processing scripts
pnpm process:events         # Process raw event logs into DB
pnpm process:competitions   # Process raw competition logs into DB
pnpm process:results        # Process raw result logs into DB
```

---

## pg-boss Scheduler

The scheduler is implemented in `src/lib/server/scheduler.ts` and started via `scripts/run-scheduler.ts`.

### Scheduled Jobs (all times in `Europe/Prague` timezone)

| Queue name | Cron | Description |
|---|---|---|
| `scrape-events-weekly` | `0 0 * * 1` | Every **Monday at 00:00** – runs `scripts/scrape-events.ts` |
| `scrape-competitions-weekly` | `5 0 * * 1` | Every **Monday at 00:05** – runs `scripts/scrape-competitions.ts` |
| `scrape-results-weekly` | `0 3 * * 1` | Every **Monday at 03:00** – runs `scripts/scrape-results.ts` |

### How it works

1. `initScheduler()` connects pg-boss to the same PostgreSQL database (env var `DATABASE_URL`).
2. pg-boss stores job queues and schedules in the `pgboss` schema.
3. Each scheduled job executes the corresponding TypeScript script using `execSync('tsx <script>')`.
4. Workers are registered with `boss.work(queueName, handler)`.
5. `stopScheduler()` gracefully shuts down pg-boss on `SIGTERM`/`SIGINT`.

### Running the scheduler in production

```bash
# Standalone process (recommended for production)
pnpm scheduler
```

The scheduler process must stay alive for jobs to execute. Use a process manager (e.g., `pm2`, `systemd`) to keep it running.

---

## Database Schema (Drizzle ORM)

Located in `src/lib/server/db/schema.ts`.

| Table | Description |
|---|---|
| `log` | Raw API responses saved before processing |
| `event` | Processed dance sport events |
| `competition` | Competitions within events |
| `participant` | Competitors/results within a competition |
| `enums` | Lookup/enum values (age groups, disciplines, etc.) |

Migrations are in the `drizzle/` directory.

---

## Scraping Architecture

All scrapers extend `BaseScraper` (`scripts/base-scraper.ts`):

1. **Scrape** – Fetch data from the CSTS API and save raw JSON into the `log` table.
2. **Process** – Parse the raw log and upsert structured data into `event`, `competition`, `participant` tables.

Each scraper automatically triggers its corresponding process script after a successful scrape.

---

## Workflow

Each data pipeline consists of two phases: **scrape** (fetch from API → save raw JSON to `log` table) and **process** (parse raw `log` entries → upsert structured data into domain tables). Processing is triggered automatically right after a successful scrape.

---

### 1. Process Events (`scrape-events.ts` → `process-events.ts`)

**Trigger:** Every Monday at 00:00 (Europe/Prague) via pg-boss, or manually with `pnpm scrape:events`.

**Scrape phase:**
- Builds URL: `https://www.csts.cz/api/1/competition_events?from=<today-7d>&to=<today>`
- Fetches the list of dance sport events from the CSTS API.
- Saves the raw JSON array to the `log` table with `type = 'competition_events'` and `is_processed = false`.

**Process phase (`process-events.ts`):**
- Reads all `log` rows where `type = 'competition_events'` and `is_processed = false`.
- For each item in the JSON array, inserts one row into the `event` table:

| Column | Source field |
|--------|--------------|
| `event_id` | `eventId` |
| `date_from` | `dateFrom` |
| `date_to` | `dateTo` |
| `title` | `eventTitle` |
| `location` | `location` |
| `log_id` | `log.id` |
| `is_processed` | defaults to `false` (used by competition scraper) |

- Marks the `log` entry as `is_processed = true` after all items are saved.

---

### 2. Process Competitions (`scrape-competitions.ts` → `process-competitions.ts`)

**Trigger:** Every Monday at 00:05 (Europe/Prague) via pg-boss, or manually with `pnpm scrape:competitions`.

**Scrape phase:**
- Queries the `event` table for all rows where `is_processed = false` (events not yet scraped for competitions).
- For each such event, builds URL: `https://www.csts.cz/api/1/events/<event_id>/competitions`
- Saves the raw JSON array to the `log` table with `type = 'competitions'` and `is_processed = false`.
- Marks the `event` row as `is_processed = true`.
- Waits **1 minute** between events to respect API rate limits.

**Process phase (`process-competitions.ts`):**
- Reads all `log` rows where `type = 'competitions'` and `is_processed = false`.
- For each competition item, resolves human-readable labels from the `enums` table for: `ageId`, `disciplineId`, `seriesId`, `typeId`, `fromClassId`.
- Inserts one row into the `competition` table:

| Column | Source / resolved value |
|--------|------------------------|
| `competition_id` | `id` |
| `event_id` | `eventId` |
| `age` | resolved from `enums` (type `ageId`) |
| `discipline` | resolved from `enums` (type `disciplineId`) |
| `series` | resolved from `enums` (type `seriesId`) |
| `type` | resolved from `enums` (type `typeId`) |
| `from_class` | resolved from `enums` (type `fromClassId`) |
| `is_processed` | defaults to `false` (used by results scraper) |

- Marks the `log` entry as `is_processed = true` after all items are saved.

---

### 3. Process Results (`scrape-results.ts` → `process-results.ts`)

**Trigger:** Every Monday at 03:00 (Europe/Prague) via pg-boss, or manually with `pnpm scrape:results`.

**Scrape phase:**
- Queries the `competition` table for all rows where `is_processed = false` (competitions not yet scraped for results).
- For each such competition, builds URL: `https://www.csts.cz/api/1/competitions/<competition_id>/result`
- Saves the raw JSON array to the `log` table with `type = 'result'` and `is_processed = false`.
- Marks the `competition` row as `is_processed = true` (only when data is non-empty).
- Waits **1 minute** between competitions to respect API rate limits.

**Process phase (`process-results.ts`):**
- Reads all `log` rows where `type = 'result'` and `is_processed = false`.
- For each result entity, iterates over `entity.competitors` and inserts one row per competitor into the `participant` table:

| Column | Source field |
|--------|--------------|
| `competition_id` | `entity.competitionId` |
| `club` | `competitor.club` |
| `first` | `competitor.competitor.name1 + surname1` |
| `second` | `competitor.competitor.name2 + surname2` (if present) |
| `ranking` | `competitor.ranking` |
| `ranking_to` | `competitor.rankingTo` |

- Marks the `log` entry as `is_processed = true` after all competitors are saved.

---

## Project Structure

```
src/
  lib/
    server/
      scheduler.ts        # pg-boss setup and job handlers
      db/
        schema.ts         # Drizzle table definitions
        index.ts          # DB connection
        loaders.ts        # Data loading helpers
    components/           # Svelte UI components
  routes/
    +page.svelte          # Main page (filter + results)
    +page.server.ts       # Server-side data loading
    api/
      clubs/+server.ts    # REST endpoint: list of clubs
      results/+server.ts  # REST endpoint: filtered results

scripts/
  run-scheduler.ts        # Entry point for standalone scheduler
  scrape-events.ts        # Scrape events
  scrape-competitions.ts  # Scrape competitions
  scrape-results.ts       # Scrape results
  process-events.ts       # Process events
  process-competitions.ts # Process competitions
  process-results.ts      # Process results
  base-scraper.ts         # Shared scraper logic
  base-processor.ts       # Shared processor logic
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (used by Drizzle and pg-boss) |

---

## Useful Documentation

| Technology | URL |
|---|---|
| Svelte 5 (LLM-friendly docs) | https://svelte.dev/docs/llms |
| Svelte 5 runes & reactivity | https://svelte.dev/docs/svelte/what-are-runes |
| SvelteKit routing | https://kit.svelte.dev/docs/routing |
| SvelteKit load functions | https://kit.svelte.dev/docs/load |
| SvelteKit server routes | https://kit.svelte.dev/docs/routing#server |
| Drizzle ORM docs | https://orm.drizzle.team/docs/overview |
| Drizzle ORM – PostgreSQL | https://orm.drizzle.team/docs/get-started/postgresql-new |
| Drizzle ORM – queries | https://orm.drizzle.team/docs/select |
| pg-boss README | https://github.com/timgit/pg-boss/blob/master/README.md |
| TypeScript handbook | https://www.typescriptlang.org/docs/handbook/intro.html |

---

## Acceptance Criteria

The following must always hold. Do not break these when making changes:

- `pnpm dev` starts without errors
- `pnpm build` completes without TypeScript or Svelte errors
- Competition results are displayed within 3 seconds of page load
- On a mobile viewport (375 px wide) the layout is readable without horizontal scroll
- The filter (time range + club) correctly narrows displayed results
- The pg-boss scheduler starts cleanly with `pnpm scheduler` and all three queues are registered
- All three cron jobs fire at the correct times in the `Europe/Prague` timezone
- The database schema is always in sync with the Drizzle schema file (migrations applied)
- API endpoints (`/api/clubs`, `/api/results`) return valid JSON
- The app works with JavaScript disabled for the initial page load (SSR must render results)

---

## Do Not

1. Do not use `any` in TypeScript — always type correctly
2. Do not use Svelte 4 syntax — Svelte 5 only (`$state`, `$derived`, `$props`, runes)
3. Do not use `on:event` directives — in Svelte 5 use `onevent` (e.g. `onclick`)
4. Do not use client-side `fetch` directly in components — always go through SvelteKit `load` functions or API routes
5. Do not add code comments unless they are necessary to explain non-trivial logic
6. Do not modify database tables manually — always use Drizzle migrations (`pnpm db:generate` + `pnpm db:migrate`)
7. Do not create per-component CSS files — everything global belongs in `src/app.css`, scoped styles go in the `<style>` block of the `.svelte` file
8. Do not run scraping scripts directly from SvelteKit routes — only via the pg-boss scheduler or manually via `pnpm scrape:*`
9. Do not use `export let` for props in Svelte 5 — use `$props()`
10. Do not add external UI libraries (Tailwind, shadcn, etc.) without explicit approval
