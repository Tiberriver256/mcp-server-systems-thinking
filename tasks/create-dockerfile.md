# Create Dockerfile

## Objective

Create a multi-stage Dockerfile for containerized deployment as specified in the PRD.

## Tasks

1. Create Dockerfile with multi-stage build:
   - Stage 1: Node.js build environment with TypeScript compilation
   - Stage 2: Minimal runtime image with compiled dist/
2. Use Node 20 LTS base image
3. Install only production dependencies in runtime stage
4. Configure proper user permissions (non-root)
5. Expose appropriate port for FastMCP server
6. Add health check using the /healthz endpoint
7. Optimize image size and build cache

## Acceptance Criteria

- [ ] Multi-stage Dockerfile builds successfully
- [ ] TypeScript compilation in build stage
- [ ] Minimal runtime image with only necessary files
- [ ] Non-root user configuration
- [ ] Health check configured
- [ ] Image size optimized
- [ ] Container runs MCP server correctly
