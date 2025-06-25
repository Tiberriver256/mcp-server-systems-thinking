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

// Systems-thinking guidance from PRD section 8
const SYSTEMS_THINKING_TUTORIAL = `**WHEN TO USE** – Use this tool when you want to explore a complex situation systematically. Start with what you observe, then build understanding piece by piece through conversation and investigation.

**SYSTEMS THINKING IS A DISCOVERY PROCESS**
Don't try to fill out everything at once! This tool is designed to help you:
- Start with basic observations about a problematic situation
- Gradually identify system elements through discussion and research
- Build understanding of relationships and dynamics over time
- Iterate and refine your mental model as you learn more

**GETTING STARTED**
Begin with just the basics:
1. What problem or behavior pattern are you trying to understand?
2. What's the system's apparent purpose (from observing its behavior)?
3. What are some obvious elements (people, things, processes) involved?

**THE FIELDS EXPLAINED**

- **boundary.purpose** – What does this system seem designed to accomplish? (Judge by results, not intentions)
- **elements** – The key actors, components, resources involved
- **interconnections** – How elements influence each other (causal links, information flows, material flows)
- **stocks & flows** – Things that accumulate (stocks) and the rates that change them (flows)
- **loops** – Circular cause-and-effect chains that either stabilize (balancing) or amplify (reinforcing) change
- **leverage_points** – Where small changes could create big impacts (see Meadows' 12 points below)

**HOW TO IDENTIFY IF SOMETHING IS A SYSTEM**
A) Distinct parts exist, **and** B) Parts affect each other, **and** C) They produce behavior different from individual parts, **and** D) This behavior persists over time.

**MEADOWS' 12 LEVERAGE POINTS** (use exact labels):
1. "The power to transcend paradigms"
2. "The mindset or paradigm out of which the system arises"  
3. "The goals of the system"
4. "The power to add, change, evolve, or self-organize system structure"
5. "The rules of the system (incentives, punishments, constraints)"
6. "The structure of information flows (who does and does not have access to information)"
7. "The gain around driving positive feedback loops"
8. "The strength of negative feedback loops, relative to the impacts they are trying to correct against"
9. "The lengths of delays, relative to the rate of system changes"
10. "The structure of material stocks and flows and nodes of intersection"
11. "The sizes of buffers and other stabilizing stocks, relative to their flows"
12. "Constants, parameters, numbers (subsidies, taxes, standards)"

**ITERATIVE APPROACH**
- Submit partial documents to get feedback and identify gaps
- Use other tools to research and gather data about your situation
- Discuss findings and refine your understanding
- The tool will guide you toward completeness over multiple iterations`;

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
  description: `Collaborate on building a systems-thinking analysis through iterative exploration. Submit partial or complete documents to get guidance, identify gaps, and refine your understanding. The tool will help you discover system dynamics step-by-step rather than requiring everything upfront.

${SYSTEMS_THINKING_TUTORIAL}`,

  parameters: z.object({
    document: z.unknown().describe('Full JSON document conforming to SystemDoc schema'),
  }),

  execute: async ({ document }) => {
    logger.info('Processing systems thinking document');

    try {
      // Retrieve the existing document, or start with an empty object
      const existingDoc = storage.retrieve((document as any)?.system_name) || {};

      // Merge the new document with the existing one
      const mergedDoc = { ...existingDoc, ...document };

      // First validate against Zod schema
      const schemaValidation = validateSystemDoc(mergedDoc);

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
      if (systemDoc.system_name) {
        storage.store(systemDoc.system_name, systemDoc);
        logger.info('Document stored successfully', { systemName: systemDoc.system_name });
      }

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
