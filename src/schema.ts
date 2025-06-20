import { z } from 'zod';

// Donella Meadows' 12 Leverage Points (in order from highest to lowest leverage)
const LEVERAGE_POINTS = [
  { id: 1, label: 'The power to transcend paradigms' },
  { id: 2, label: 'The mindset or paradigm out of which the system arises' },
  { id: 3, label: 'The goals of the system' },
  { id: 4, label: 'The power to add, change, evolve, or self-organize system structure' },
  { id: 5, label: 'The rules of the system (incentives, punishments, constraints)' },
  {
    id: 6,
    label: 'The structure of information flows (who does and does not have access to information)',
  },
  { id: 7, label: 'The gain around driving positive feedback loops' },
  {
    id: 8,
    label:
      'The strength of negative feedback loops, relative to the impacts they are trying to correct against',
  },
  { id: 9, label: 'The lengths of delays, relative to the rate of system changes' },
  { id: 10, label: 'The structure of material stocks and flows and nodes of intersection' },
  { id: 11, label: 'The sizes of buffers and other stabilizing stocks, relative to their flows' },
  { id: 12, label: 'Constants, parameters, numbers (subsidies, taxes, standards)' },
] as const;

// Boundary schema
const BoundarySchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  scope_in: z.array(z.string()).min(1, 'At least one scope_in item is required'),
  scope_out: z.array(z.string()).min(1, 'At least one scope_out item is required'),
});

// Interconnection schema
const InterconnectionSchema = z.object({
  from: z.string().min(1, 'From element is required'),
  to: z.string().min(1, 'To element is required'),
  type: z.enum(['causal', 'flow', 'info'], {
    errorMap: () => ({ message: 'Type must be one of: causal, flow, info' }),
  }),
});

// Stock schema
const StockSchema = z.object({
  id: z.string().min(1, 'Stock ID is required'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().min(1, 'Description is required'),
});

// Flow schema
const FlowSchema = z.object({
  id: z.string().min(1, 'Flow ID is required'),
  from_stock: z.string().min(1, 'From stock is required'),
  to_stock: z.string().min(1, 'To stock is required'),
  rate_expr: z.string().min(1, 'Rate expression is required'),
});

// Loop schemas
const LoopItemSchema = z.object({
  id: z.string().min(1, 'Loop ID is required'),
  description: z.string().min(1, 'Loop description is required'),
});

const LoopsSchema = z.object({
  balancing: z.array(LoopItemSchema),
  reinforcing: z.array(LoopItemSchema),
});

// Leverage point schema - validates against Meadows' 12 points
const LeveragePointSchema = z
  .object({
    id: z.number().int().min(1).max(12, 'Leverage point ID must be between 1 and 12'),
    label: z.string().min(1, 'Label is required'),
    is_applicable: z.boolean(),
  })
  .refine(
    (data) => {
      const expectedLabel = LEVERAGE_POINTS.find((lp) => lp.id === data.id)?.label;
      return expectedLabel === data.label;
    },
    {
      message: 'Label must match the standard Donella Meadows leverage point definition',
    },
  );

// Intervention schema
const InterventionSchema = z.object({
  target_leverage_id: z
    .number()
    .int()
    .min(1)
    .max(12, 'Target leverage ID must be between 1 and 12'),
  proposal: z.string().min(1, 'Proposal is required'),
  expected_effect: z.string().min(1, 'Expected effect is required'),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
});

// Main SystemDoc schema
export const SystemDocSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  system_name: z.string().min(1, 'System name is required'),
  boundary: BoundarySchema,
  elements: z
    .array(z.string().min(1, 'Element name cannot be empty'))
    .min(1, 'At least one element is required'),
  interconnections: z.array(InterconnectionSchema),
  stocks: z.array(StockSchema),
  flows: z.array(FlowSchema),
  loops: LoopsSchema,
  leverage_points: z.array(LeveragePointSchema).length(12, 'Must include all 12 leverage points'),
  interventions: z.array(InterventionSchema),
});

// Inferred TypeScript type
export type SystemDoc = z.infer<typeof SystemDocSchema>;

// Validation helper functions
export const validateSystemDoc = (data: unknown) => {
  return SystemDocSchema.safeParse(data);
};

export const parseSystemDoc = (data: unknown): SystemDoc => {
  return SystemDocSchema.parse(data);
};

// Helper to get the complete leverage points structure
export const getStandardLeveragePoints = () => {
  return LEVERAGE_POINTS.map((lp) => ({
    id: lp.id,
    label: lp.label,
    is_applicable: false,
  }));
};

// Validation constants for reference
export const INTERCONNECTION_TYPES = ['causal', 'flow', 'info'] as const;
export const LEVERAGE_POINT_DEFINITIONS = LEVERAGE_POINTS;
