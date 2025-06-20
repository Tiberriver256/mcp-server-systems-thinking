# Implement Zod Schema

## Objective

Create the complete Zod schema for SystemDoc validation as specified in the PRD data model.

## Tasks

1. Define the SystemDoc interface in `src/schema.ts`
2. Implement Zod schemas for:
   - Boundary (purpose, scope_in, scope_out)
   - Elements array
   - Interconnections (from, to, type: causal|flow|info)
   - Stocks (id, unit, description)
   - Flows (id, from_stock, to_stock, rate_expr)
   - Feedback loops (balancing, reinforcing)
   - Leverage points (id 1-12, label, is_applicable)
   - Interventions (target_leverage_id, proposal, expected_effect, confidence)
3. Export both the Zod schema and inferred TypeScript type
4. Add schema validation helpers

## Acceptance Criteria

- [ ] Complete Zod schema matches PRD data model exactly
- [ ] TypeScript types are properly inferred
- [ ] Schema validates valid documents and rejects invalid ones
- [ ] Leverage points constrained to IDs 1-12 with correct labels
