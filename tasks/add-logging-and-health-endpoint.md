# Add Logging and Health Endpoint

## Objective

Implement structured logging with Pino and add health endpoint for observability.

## Tasks

1. Setup Pino logger for structured JSON logging
2. Add request logging middleware to FastMCP server
3. Log validation results and errors appropriately
4. Implement `/healthz` endpoint for Kubernetes liveness/readiness probes
5. Add logging for:
   - Server startup/shutdown
   - Tool invocations
   - Validation failures
   - Storage operations
6. Configure log levels (info, warn, error)

## Acceptance Criteria

- [ ] Pino logger configured for structured JSON output
- [ ] Request/response logging implemented
- [ ] Health endpoint returns 200 OK when server is healthy
- [ ] Appropriate log levels for different events
- [ ] No sensitive data logged
- [ ] Logs are readable and useful for debugging
