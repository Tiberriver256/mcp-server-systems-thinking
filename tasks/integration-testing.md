# Integration Testing

## Objective

Test the complete MCP server with realistic system documents using FastMCP's interactive dev server.

## Tasks

1. Create sample SystemDoc JSON files for testing:
   - Valid complete system (should return complete=true)
   - Invalid schema (should return HTTP 422)
   - Missing stock references (should show inconsistency_warnings)
   - Incomplete leverage points (should show missing_fields)
2. Manual testing workflow:
   - Start server with `npm run dev`
   - Use `npx fastmcp dev` to invoke `systems_thinking_writer`
   - Test POST large sample docs and observe validation responses
   - Verify GET /model returns stored documents
3. Document testing procedures and expected outcomes
4. Validate end-to-end functionality

## Acceptance Criteria

- [ ] Sample test documents created covering all scenarios
- [ ] Manual testing procedure documented
- [ ] All validation scenarios tested and working
- [ ] Tool correctly validates and stores documents
- [ ] FastMCP integration working properly
- [ ] End-to-end workflow validated
