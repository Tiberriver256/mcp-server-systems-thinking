# Product Requirements Document (PRD)

## 1  Objective

Deliver a **Systems‑Thinking MCP server** that lets an AI agent submit a full systems‑thinking representation (single JSON document) over HTTP. The server validates structure, persists the latest version atomically, and returns validation gaps so the agent can iterate until the document is complete.

## 2  Background & Motivation

Sequential‑thinking servers proved that forcing LLMs through a rigid I/O contract improves reasoning quality. We apply the same pattern to Donella Meadows‑style systems analysis, enabling agents to reason about boundaries, stocks/flows, feedback loops, and leverage points with minimal server logic.

## 3  Scope

### In‑scope (MVP)

* One MCP Tool: `systems_thinking_writer` (PUT/POST full JSON each time)
* Validation & gap detection (hard structural checks)
* Atomic persistence of latest document (in‑memory → Postgres JSONB)
* HTTP streaming transport (FastMCP default)
* Basic observability (request logs, health endpoint)

### Out‑of‑scope (Post‑MVP)

* Soft warnings / heuristics (e.g., too many reinforcing loops)
* Fine‑grained PATCH updates
* Multi‑document branching or version history navigation
* Role‑based read/write permission model

## 4  Personas & Use Cases

| Persona            | Job‑to‑be‑Done                                                                    |
| ------------------ | --------------------------------------------------------------------------------- |
| **LLM Agent**      | Build a complete systems model iteratively; keep retrying until validation passes |
| **System Analyst** | Fetch the current JSON document for visualization or manual review                |
| **DevOps**         | Deploy and monitor the MCP service                                                |

## 5  Functional Requirements

### 5.1  Tool Definition

* **Name**: `systems_thinking_writer`
* **Input**: Full JSON document conforming to Zod schema
* **Output**: `{ complete: boolean, missing_fields: string[], inconsistency_warnings: string[] }`
* **Contract**: Reject (HTTP 422) if JSON fails schema; otherwise return validation arrays. `complete === true` only when both arrays are empty.

### 5.2  Endpoint Behaviour

| Method | Path     | Body     | Response                               |
| ------ | -------- | -------- | -------------------------------------- |
| POST   | `/model` | JSON doc | Validation result & copy of stored doc |
| GET    | `/model` | –        | Latest stored doc                      |

*Server overwrites existing doc on every successful POST.*

### 5.3  Validation Rules (MVP)

* Every `flow.from_stock` & `flow.to_stock` must have matching `stocks.id`
* Loops may reference only declared elements
* If a `leverage_point.is_applicable === true` there must be at least one matching `intervention.target_leverage_id`

## 6  Data Model (abridged)

```jsonc
{
  "version": "1.0.0",
  "system_name": "string",
  "boundary": { "purpose": "string", "scope_in": [""], "scope_out": [""] },
  "elements": ["string"],
  "interconnections": [ { "from": "", "to": "", "type": "causal|flow|info" } ],
  "stocks": [ { "id": "", "unit": "", "description": "" } ],
  "flows":  [ { "id": "", "from_stock": "", "to_stock": "", "rate_expr": "" } ],
  "loops": {
    "balancing":   [ { "id": "", "description": "" } ],
    "reinforcing": [ { "id": "", "description": "" } ]
  },
  "leverage_points": [ { "id": 12, "label": "Constants / parameters", "is_applicable": false }, … ],
  "interventions": [ { "target_leverage_id": 4, "proposal": "…", "expected_effect": "…", "confidence": 0.7 } ]
}
```

## 7  Architecture & Tech Stack

* **Runtime**: Node 20+ with **TypeScript**
* **Framework**: **FastMCP** (HTTP streaming transport)
* **Validation**: **Zod** (schema reused for prompts & runtime)
* **Persistence**: In‑memory Map → nightly flush to **Postgres** (JSONB)
* **Container**: Dockerfile with multi‑stage build (tsc compile then dist run)
* **Observability**: pino logs, `/healthz` endpoint for k8s liveness/readiness

### Component Diagram (text)

```
Client Agent → FastMCP Tool → Zod Validator → InMemoryCache → Postgres
                                   ↑
                        Gap‑Detection Logic
```

## 8  Systems‑Thinking Tutorial (Tool Prompt Seed)

Use the following condensed guidance verbatim in the `systems_thinking_writer` **tool description** so the AI knows *when* and *how* to use the tool:

> **WHEN TO USE**  – Call this tool any time you need a structured, Meadows‑style snapshot of a complex situation that clearly has interacting parts and feedback (e.g. urban traffic, product adoption, climate policy).
>
> **WHAT THE FIELDS MEAN**
>
> * **boundary.purpose** – the system’s *why*. Deduced from observed behaviour, not rhetoric. fileciteturn3file4L20-L30
> * **elements & interconnections** – the nouns and their physical/info links. fileciteturn3file9L38-L41
> * **stocks & flows** – accumulations and the rates that change them. fileciteturn3file3L9-L22
> * **loops** – balancing (B) dampen change; reinforcing (R) amplify. fileciteturn3file11L12-L19
> * **leverage\_points** – Meadows’s 12 intervention levers, from parameters (12) to paradigm shifts (2) and *transcending paradigms* (1). fileciteturn3file2L34-L38
>
> **HOW TO IDENTIFY A SYSTEM**
> A) parts exist, **and** B) they affect each other, **and** C) they create behaviour distinct from each part alone, **and** D) that behaviour persists over time. fileciteturn3file1L18-L25
>
> **RECOMMENDED FILL‑OUT PATH**
>
> 1. **Purpose & boundary** – one sentence each.
> 2. **Elements list** – nouns only.
> 3. **Interconnections** – causal, flow, or info links.
> 4. **Stocks & flows** – declare measurable stores then inflow/outflow pipes.
> 5. **Feedback loops** – tag each loop B or R; reference involved stocks.
> 6. **Leverage points** – tick applicable IDs (1‑12).
> 7. **Interventions** – optional proposals targeting leverage IDs.

Keep iterating until the server returns `complete: true`.

---

## 9  Extended Systems‑Thinking Reference (Team Use Only)

A quick‑access cheat‑sheet so we don’t have to re‑scan Meadows every sprint.

| Concept                  | One‑liner                                                                                                           | Fast sanity check                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Elements**             | Tangible or intangible parts of the system                                                                          | Can you point at it? If yes, it’s an element.                             |
| **Interconnections**     | Physical flows or information signals                                                                               | Does changing A alter B *without* outside influence?                      |
| **Purpose/Function**     | The consistent pattern the system produces                                                                          | Observe *behaviour*, not mission statements.                              |
| **Stock**                | Memory of past flows (bathtub water, money)                                                                         | Units must be additive over time.                                         |
| **Flow**                 | Rate changing a stock (inflow/outflow)                                                                              | Has units per time.                                                       |
| **Balancing Loop (B)**   | Goal‑seeking stabiliser                                                                                             | If discrepancy shrinks over time, it’s B.                                 |
| **Reinforcing Loop (R)** | Self‑amplifying growth/decay                                                                                        | Exponential trends; watch doubling time.                                  |
| **Delay**                | Gap between cause & effect                                                                                          | Look for oscillations or overshoot.                                       |
| **Hierarchy**            | Nested subsystems with their own purposes                                                                           | Tight coupling at lower levels, loose at top.                             |
| **Resilience**           | Ability to absorb shock and keep purpose                                                                            | Diversity, buffers, modular slack increase it.                            |
| **Leverage ID 12 → 1**   | Parameters → feedback strength → info flows → rules → self‑organisation → purpose → paradigm → *transcend paradigm* | Higher numbers easier to tweak, lower numbers more powerful but cultural. |

### Field‑by‑field Deep‑Dive

* **boundary.scope\_in / scope\_out** – Be explicit; ambiguity breeds model creep.
* **elements** – Prioritise catalytic actors (ones that appear in many loops).
* **interconnections.type** – `causal` (solid arrow), `flow` (pipe), `info` (dashed).
* **stocks** – Check each has at least one in‑flow *or* out‑flow; else it’s inert.
* **flows.rate\_expr** – Keep human‑readable (`0.1 * demand`). Parser TBD.
* **loops** – Name loops with verb‑phrase + polarity (`Sales Reinvest R`).
* **leverage\_points** – If `is_applicable=true` but no intervention, warn.

### Rapid Diagnostic Questions

1. What stock is unexpectedly changing fastest? Why?
2. Which loop currently dominates behaviour?
3. Where is the biggest information delay?
4. Which leverage point needs the *least* political capital to nudge?

> “The behavior of a system cannot be known just by knowing the elements.” fileciteturn3file14L1-L4

---

*Sections 8 (Non‑Functional Requirements) and 9 (Milestones) removed per user request.*
