// Structural validation logic for cross-references

import { SystemDoc } from './schema';

export interface ValidationResult {
  complete: boolean;
  missing_fields: string[];
  inconsistency_warnings: string[];
}

export const validateSystemDocGaps = (doc: SystemDoc): ValidationResult => {
  const missing_fields: string[] = [];
  const inconsistency_warnings: string[] = [];

  // Validate stock-flow references
  const stockIds = new Set(doc.stocks.map((s) => s.id));
  doc.flows.forEach((flow) => {
    if (!stockIds.has(flow.from_stock)) {
      inconsistency_warnings.push(
        `Flow "${flow.id}" references non-existent from_stock "${flow.from_stock}"`,
      );
    }
    if (!stockIds.has(flow.to_stock)) {
      inconsistency_warnings.push(
        `Flow "${flow.id}" references non-existent to_stock "${flow.to_stock}"`,
      );
    }
  });

  // Validate loop references
  const elementIds = new Set(doc.elements);
  doc.loops.balancing.forEach((loop) => {
    // Assuming loops reference elements directly by id.
    // If loops can reference other types of entities (stocks, flows), this logic needs adjustment.
    // The current schema for LoopItemSchema only has 'id' and 'description',
    // it does not specify what this 'id' refers to. Assuming it refers to an element.
    // TODO: Clarify what loop item IDs refer to if not elements.
    // For now, we'll assume loop.id should be an element name.
    // However, the task description says "check if the referenced elements exist in `elements`"
    // which implies that loops themselves are not elements, but *reference* elements.
    // The current LoopItemSchema (id, description) doesn't have a clear field for "referenced elements".
    // Let's assume for now that the `loop.id` is meant to be the ID of an *element* that is part of the loop,
    // or that there's a missing field in LoopItemSchema for `elements_in_loop: string[]`.
    // Given the current structure, this check might be difficult to implement meaningfully.
    // For the purpose of this task, I will assume loop.id should be found in doc.elements.
    // This is a point of ambiguity.
    // Let's re-read: "Validate loops reference only declared elements"
    // This could mean that the `id` of a loop item itself must be one of the `doc.elements`.
    // Or it could mean that a loop *contains* references to elements, which are not currently in the schema.
    // Given LoopItemSchema only has `id` and `description`, let's assume `loop.id` must be in `doc.elements`.
    if (!elementIds.has(loop.id)) {
      inconsistency_warnings.push(
        `Balancing loop "${loop.id}" references non-existent element "${loop.id}"`,
      );
    }
  });
  doc.loops.reinforcing.forEach((loop) => {
    if (!elementIds.has(loop.id)) {
      inconsistency_warnings.push(
        `Reinforcing loop "${loop.id}" references non-existent element "${loop.id}"`,
      );
    }
  });

  // Validate leverage point interventions
  const applicableLeveragePointIds = new Set(
    doc.leverage_points.filter((lp) => lp.is_applicable).map((lp) => lp.id),
  );
  const interventionTargetIds = new Set(doc.interventions.map((i) => i.target_leverage_id));

  applicableLeveragePointIds.forEach((applicableId) => {
    if (!interventionTargetIds.has(applicableId)) {
      const lp = doc.leverage_points.find(l => l.id === applicableId);
      inconsistency_warnings.push(
        `Applicable leverage point "${lp?.label}" (ID: ${applicableId}) has no corresponding intervention.`,
      );
    }
  });

  const complete = missing_fields.length === 0 && inconsistency_warnings.length === 0;

  return {
    complete,
    missing_fields,
    inconsistency_warnings,
  };
};
