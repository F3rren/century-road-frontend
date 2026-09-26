# AGENTS.md — Century Road Frontend

Century Road is a React/Vite/TS SPA: an interactive historical almanac (globe + "on this day" events) backed by a Spring Boot gateway in the sibling repo [century-road-backend](https://github.com/F3rren/century-road-backend). All backend calls go through `src/services/api.ts` — never fetch the gateway directly from a component.

**Stack**: React 18.3.1, Vite ^8.3.0, TypeScript ^5.5.3, Tailwind ^3.4.10, react-router-dom ^7, i18next/react-i18next, maplibre-gl ^6.10.0, lucide-react.

**Commands**:
```
npm run dev       # Vite dev server, :5173
npm run build     # tsc && vite build — this IS the typecheck
npm run lint      # eslint --max-warnings 0
npm run preview
```
No test suite exists — don't invent an `npm test` command or assume coverage.

**Conventions**: feature-folder pattern (`src/features/<name>/`, own `components/hooks/lib/services/types`, cross-feature imports via `index.ts` barrels only). i18n keys for all UI copy except Privacy/Terms (Italian-only, intentional). Errors are plain thrown `Error`s, not a custom error type.

**Never touch**: `.env` (real values), `.impeccable/` and the `<!-- impeccable:product-schema 1 -->` marker in `PRODUCT.md` (owned by the installed impeccable skill's read/write contract), the two build-time guards in `vite.config.ts` without understanding what they prevent (mixed content, leaked secrets).

**Ask before**: adding a dependency, changing the supported-language list, changing routing structure, editing `DESIGN.md`/`PRODUCT.md` content directly (use the impeccable skill's own flow instead).

**References**: [architecture.md](docs/architecture.md) · [DESIGN.md](DESIGN.md) · [PRODUCT.md](PRODUCT.md) · [PRD.md](docs/PRD.md) · backend's [architecture.md](https://github.com/F3rren/century-road-backend/blob/main/docs/architecture.md) / [AGENTS.md](https://github.com/F3rren/century-road-backend/blob/main/AGENTS.md)
