# CLAUDE.md

## Project Overview

**backlog-to-cacoo** is a browser extension (Manifest V3) that adds a "Copy to Cacoo" button to Backlog issue pages. It extracts issue data from the DOM, formats it as Cacoo-compatible JSON, and copies it to the clipboard using a custom MIME type (`cacoo/shape`) so users can paste issues directly as cards in Cacoo diagrams.

- **Author:** simochee
- **License:** MIT
- **Target sites:** `*.backlog.jp/view/*` and `*.backlog.com/view/*`

## Tech Stack

- **Build system:** [WXT](https://wxt.dev/) (Web Extension Toolkit) v0.20+
- **Language:** TypeScript 5.9+ (ES modules)
- **Test framework:** Vitest 4.0+ with jsdom environment
- **Coverage:** @vitest/coverage-v8
- **Styling:** CSS Modules (`*.module.css`)

## Directory Structure

```
entrypoints/
  content.ts          # Content script entry point — orchestrates the full flow
lib/
  extract-issue-data.ts   # Scrapes Backlog issue DOM for data
  build-cacoo-json.ts     # Builds Cacoo-compatible JSON payload
  copy-to-clipboard.ts    # Clipboard write via custom MIME type
  ui.ts                   # Button injection and toast notifications
  ui.module.css           # Scoped styles for injected UI elements
  *.test.ts               # Tests colocated with source files
```

Generated/ignored directories: `.wxt/`, `.output/`, `dist/`, `node_modules/`.

## Commands

```bash
npm run dev          # Start WXT dev mode (hot-reload extension)
npm run build        # Production build → dist/
npm run test         # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
```

## Architecture

The data flow is linear and modular:

```
content.ts → extractIssueData() → buildCacooJson() → copyToClipboard()
                                                    → showToast()
```

1. **`entrypoints/content.ts`** — Registers the content script and wires up the button click handler.
2. **`lib/extract-issue-data.ts`** — Queries DOM selectors (`.ticket__key-number`, `.ticket__summary`, `.ticket__properties tr`) to extract issue fields. Exports the `IssueData` interface.
3. **`lib/build-cacoo-json.ts`** — Constructs the Cacoo card JSON. Color-codes cards: red for bugs/high priority, green for low priority, blue otherwise. Uses `crypto.randomUUID()` for shape IDs.
4. **`lib/copy-to-clipboard.ts`** — Uses `document.execCommand('copy')` with a copy event handler to write both `cacoo/shape` (custom MIME) and `text/plain` formats. This approach is used because `navigator.clipboard.write()` doesn't support custom MIME types.
5. **`lib/ui.ts`** — Creates and appends the copy button and toast notification elements to the DOM using CSS Modules for styling.

## Code Conventions

### Naming
- **Files:** kebab-case (`extract-issue-data.ts`)
- **Functions/variables:** camelCase (`extractIssueData`, `cacooJson`)
- **Constants:** UPPER_SNAKE_CASE (`COLOR_RED`, `BUTTON_SELECTOR`)
- **Interfaces/types:** PascalCase (`IssueData`)

### Style
- ES module imports with `@/` path alias for project root (provided by WXT)
- Optional chaining (`?.`) and nullish coalescing (`??`) for safe DOM access
- Single-responsibility functions — each module handles one concern
- Comments in Japanese where they describe Backlog-specific domain logic
- No linter or formatter config in repo — follow existing code style

### Tests
- Test files are colocated with source: `lib/foo.ts` → `lib/foo.test.ts`
- DOM setup: reset `document.body.innerHTML = ""` in `beforeEach`
- Build DOM structures manually for testing selectors
- Use `vi.fn()` for mocks, `vi.spyOn()` for spies, `vi.useFakeTimers()` for time control
- `ClipboardEvent` is polyfilled in test files since jsdom doesn't provide it
- Mock `document.execCommand` in clipboard tests
- Mock `crypto.randomUUID()` for deterministic JSON output

## Key Types

```typescript
interface IssueData {
  key: string;        // e.g. "PROJ-123"
  summary: string;    // Issue title
  assignee: string;   // Assignee name (may be empty)
  dueDate: string | null;  // "YYYY-MM-DD" or null
  type: string;       // e.g. "バグ" (Bug), "タスク" (Task)
  priority: string;   // e.g. "高" (High), "低" (Low), "中" (Normal)
  url: string;        // Full URL of the Backlog issue page
}
```

## Known Limitations

- DOM selectors are based on assumptions about Backlog's React-based UI and need validation against the actual production DOM (see TODO comments in source).
- Classic Backlog UI is not supported.
- The copy button is currently appended to `document.body` — placement should be refined for the actual Backlog page layout.
- Backlog property labels are matched by Japanese text (`担当者`, `期限日`, `種別`, `優先度`).

## Working on This Project

- Run `npm run test` before committing to verify nothing is broken.
- The `PLAN.md` file contains the original project specification, including the exact Cacoo JSON schema and data mapping details.
- TypeScript config extends WXT's generated config at `.wxt/tsconfig.json` — run `npm run dev` at least once to generate it if the `.wxt/` directory is missing.
