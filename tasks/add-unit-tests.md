# Add Unit Tests

## Objective

Create comprehensive unit tests for schema validation and gap-check logic using Vitest.

## Tasks

1. Setup Vitest configuration in project root
2. Create test files in `tests/unit/`:
   - `schema.test.ts` - Test Zod schema edge cases
   - `gap-check.test.ts` - Test structural validation logic
   - `storage.test.ts` - Test in-memory storage operations
3. Test cases for:
   - Valid SystemDoc documents
   - Invalid schema scenarios
   - Stock-flow reference validation
   - Loop reference validation
   - Leverage point-intervention matching
   - Storage operations (store/retrieve/exists)
4. Achieve good test coverage for validation logic

## Acceptance Criteria

- [ ] Vitest configured and running
- [ ] Unit tests for all Zod schema validations
- [ ] Unit tests for all gap-check validation rules
- [ ] Unit tests for storage operations
- [ ] Tests pass consistently and cover edge cases
- [ ] npm test script executes all tests
