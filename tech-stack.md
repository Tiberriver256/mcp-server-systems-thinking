# Tech Stack & Implementation Blueprint

---

## 1  Runtime & Core Libraries (MVP)

| Layer             | Library              | Version Pin | Purpose                                    |
| ----------------- | -------------------- | ----------- | ------------------------------------------ |
| **Node.js**       | `node`               | 20‑LTS      | Event‑loop, native stream APIs             |
| **Lang**          | `typescript`         | `^5.4`      | Type‑safe server & schemas                 |
| **MCP Framework** | `fastmcp`            | `^0.9`      | Minimal MCP tool host (stateful per convo) |
| **Validation**    | `zod`                | `^3.23`     | Runtime JSON validation + TS inference     |
| **Logging**       | `pino`               | `^8`        | Structured JSON logs (console only)        |
| **Testing**       | `vitest`             | `^0.34`     | Unit tests for schema & gap‑checks         |
| **Lint/Format**   | `eslint`, `prettier` | Latest      | Code hygiene                               |
| **Types**         | `@types/node`        | –           | TS intellisense                            |

_No database, HTTP test harness, or external services required._

---

## 2  Folder Structure (high‑level)

```
systems‑thinking‑mcp/
├── src/
│   ├── index.ts          # FastMCP bootstrap & tool definition
│   ├── schema.ts         # Zod SystemDoc schema
│   ├── gap‑check.ts      # Structural validators
│   └── storage/
│       └── in‑memory.ts  # Map<string, SystemDoc>
├── tests/
│   └── unit/             # Vitest specs
├── package.json
└── tsconfig.json
```

---

## 3  Local Development Workflow

1. **Setup**: `nvm install 20 && nvm use 20`.
2. Install deps: `npm ci`.
3. Run dev server with hot‑reload: `npm run dev` (uses `tsx watch`).
4. Manual tool call via FastMCP REPL: `npx fastmcp dev` then invoke `systems_thinking_writer`.
5. Unit tests: `npm test`.

`package.json` script skeleton:

```jsonc
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc -p .",
  "start": "node dist/index.js",
  "test": "vitest run",
  "lint": "eslint 'src/**/*.ts'",
  "format": "prettier --write .",
}
```

---

## 4  State Strategy

- **In‑memory Map** keyed by `system_name`.
- MCP server instance is stateful for the lifetime of a single conversation.
- No persistence layer—data is discarded once the server process terminates.

---

## 5  Testing Philosophy

- **Vitest unit tests** cover:

  - Zod schema edge‑cases.
  - Gap‑detection helper (`gap-check.ts`).

- **Manual integration**: use FastMCP’s interactive dev server to POST large sample docs and observe validation responses.

---

_Everything else—Docker, Helm, Postgres, observability stacks, env vars, security hardening, future upgrades, maintainers—has been intentionally removed per current MVP constraints._
