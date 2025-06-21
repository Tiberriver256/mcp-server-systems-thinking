// Entry point for FastMCP server

import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { SystemDocSchema, validateSystemDoc } from './schema.js';
import { validateSystemDocGaps } from './gap-check.js';
import { storage } from './storage/in-memory.js';
import pino from 'pino';

const logger = pino({
  name: 'systems-thinking-mcp',
  level: 'info',
});

// Systems-thinking tutorial from PRD section 8
const SYSTEMS_THINKING_TUTORIAL = `**WHEN TO USE** – Call this tool any time you need a structured, Meadows‑style snapshot of a complex situation that clearly has interacting parts and feedback (e.g. urban traffic, product adoption, climate policy).

**WHAT THE FIELDS MEAN**

- **boundary.purpose** – the system's _why_. Deduced from observed behaviour, not rhetoric.
- **elements & interconnections** – the nouns and their physical/info links.
- **stocks & flows** – accumulations and the rates that change them.
- **loops** – balancing (B) dampen change; reinforcing (R) amplify.
- **leverage_points** – Meadows's 12 intervention levers, from parameters (12) to paradigm shifts (2) and _transcending paradigms_ (1).

**HOW TO IDENTIFY A SYSTEM**
A) parts exist, **and** B) they affect each other, **and** C) they create behaviour distinct from each part alone, **and** D) that behaviour persists over time.

**RECOMMENDED FILL‑OUT PATH**

1. **Purpose & boundary** – one sentence each.
2. **Elements list** – nouns only.
3. **Interconnections** – causal, flow, or info links.
4. **Stocks & flows** – declare measurable stores then inflow/outflow pipes.
5. **Feedback loops** – tag each loop B or R; reference involved stocks.
6. **Leverage points** – tick applicable IDs (1‑12).
7. **Interventions** – optional proposals targeting leverage IDs.

Keep iterating until the server returns \`complete: true\`.`;

// Create FastMCP server
const server = new FastMCP({
  name: 'Systems Thinking Writer',
  version: '1.0.0',
  health: {
    enabled: true,
    path: '/healthz',
    message: 'healthy',
  },
});

// Add the systems_thinking_writer tool
server.addTool({
  name: 'systems_thinking_writer',
  description: `Submit a complete systems-thinking analysis as a JSON document. This tool validates structure, checks for gaps, and stores the document atomically if valid.

${SYSTEMS_THINKING_TUTORIAL}`,

  parameters: z.object({
    document: z.unknown().describe('Full JSON document conforming to SystemDoc schema'),
  }),

  execute: async ({ document }) => {
    logger.info('Processing systems thinking document');

    try {
      // First validate against Zod schema
      const schemaValidation = validateSystemDoc(document);

      if (!schemaValidation.success) {
        logger.warn('Schema validation failed', { errors: schemaValidation.error.errors });

        // Return HTTP 422-style error for schema validation failure
        throw new Error(
          `Schema validation failed: ${schemaValidation.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ')}`,
        );
      }

      const systemDoc = schemaValidation.data;
      logger.info('Schema validation passed', { systemName: systemDoc.system_name });

      // Perform gap checking
      const gapCheckResult = validateSystemDocGaps(systemDoc);
      logger.info('Gap check completed', {
        complete: gapCheckResult.complete,
        missingFields: gapCheckResult.missing_fields.length,
        warnings: gapCheckResult.inconsistency_warnings.length,
      });

      // Store document atomically if validation passes
      storage.store(systemDoc.system_name, systemDoc);
      logger.info('Document stored successfully', { systemName: systemDoc.system_name });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                complete: gapCheckResult.complete,
                missing_fields: gapCheckResult.missing_fields,
                inconsistency_warnings: gapCheckResult.inconsistency_warnings,
                stored_document: systemDoc,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Error processing document', { error: (error as Error).message });
      throw error;
    }
  },
});

// Start the server with stdio transport for MCP
server
  .start({
    transportType: 'stdio',
  })
  .then(() => {
    logger.info('Systems Thinking MCP Server started with stdio transport');
  })
  .catch((error) => {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  });
