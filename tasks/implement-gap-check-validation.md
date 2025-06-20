# Implement Gap Check Validation

## Objective

Create structural validation logic to detect missing fields and inconsistencies in system documents.

## Tasks

1. Implement gap detection in `src/gap-check.ts`:
   - Check every `flow.from_stock` & `flow.to_stock` has matching `stocks.id`
   - Validate loops reference only declared elements
   - Ensure applicable leverage points (is_applicable=true) have matching interventions
2. Create validation result interface: `{ complete: boolean, missing_fields: string[], inconsistency_warnings: string[] }`
3. Add helper functions for cross-reference validation
4. Return detailed error messages for each type of gap

## Acceptance Criteria

- [ ] Validates stock-flow references correctly
- [ ] Detects orphaned loop references
- [ ] Identifies leverage points without interventions
- [ ] Returns structured validation results
- [ ] complete=true only when all validations pass
