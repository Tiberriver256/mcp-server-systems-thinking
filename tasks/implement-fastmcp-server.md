# Implement FastMCP Server

## Objective

Create the main MCP server with the `systems_thinking_writer` tool using FastMCP framework.

## Tasks

1. Setup FastMCP server in `src/index.ts`
2. Implement `systems_thinking_writer` tool:
   - Input: Full JSON document conforming to SystemDoc schema
   - Output: Validation result with complete/missing_fields/inconsistency_warnings
   - HTTP 422 on schema validation failure
3. Add tool description with systems-thinking tutorial from PRD section 8
4. Integrate Zod schema validation and gap checking
5. Connect to in-memory storage for atomic document persistence
6. Handle GET /model and POST /model endpoints as specified

## Acceptance Criteria

- [ ] FastMCP server starts and accepts connections
- [ ] systems_thinking_writer tool properly defined with tutorial description
- [ ] Schema validation integrated (reject invalid JSON with 422)
- [ ] Gap checking returns structured validation results
- [ ] Atomic document storage on successful validation
- [ ] Tool returns complete=true only when validation passes
