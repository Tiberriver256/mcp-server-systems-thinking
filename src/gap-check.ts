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
  if (doc.stocks && doc.flows) {
    const stockIds = new Set(doc.stocks.map((s) => s.id));
    doc.flows.forEach((flow) => {
      if (flow.from_stock && !stockIds.has(flow.from_stock)) {
        inconsistency_warnings.push(
          `Flow "${flow.id}" references non-existent from_stock "${flow.from_stock}"`,
        );
      }
      if (flow.to_stock && !stockIds.has(flow.to_stock)) {
        inconsistency_warnings.push(
          `Flow "${flow.id}" references non-existent to_stock "${flow.to_stock}"`,
        );
      }
    });
  }

  // Validate loop references
  if (doc.elements && doc.loops) {
    const elementIds = new Set(doc.elements);
    if (doc.loops.balancing) {
      doc.loops.balancing.forEach((loop) => {
        if (loop.id && !elementIds.has(loop.id)) {
          inconsistency_warnings.push(
            `Balancing loop "${loop.id}" references non-existent element "${loop.id}"`,
          );
        }
      });
    }
    if (doc.loops.reinforcing) {
      doc.loops.reinforcing.forEach((loop) => {
        if (loop.id && !elementIds.has(loop.id)) {
          inconsistency_warnings.push(
            `Reinforcing loop "${loop.id}" references non-existent element "${loop.id}"`,
          );
        }
      });
    }
  }

  // Validate leverage point interventions
  if (doc.leverage_points && doc.interventions) {
    const applicableLeveragePointIds = new Set(
      doc.leverage_points.filter((lp) => lp.is_applicable).map((lp) => lp.id),
    );
    const interventionTargetIds = new Set(doc.interventions.map((i) => i.target_leverage_id));

    applicableLeveragePointIds.forEach((applicableId) => {
      if (applicableId && !interventionTargetIds.has(applicableId)) {
        const lp = doc.leverage_points.find(l => l.id === applicableId);
        inconsistency_warnings.push(
          `Applicable leverage point "${lp?.label}" (ID: ${applicableId}) has no corresponding intervention.`,
        );
      }
    });
  }

  const complete = missing_fields.length === 0 && inconsistency_warnings.length === 0;

  return {
    complete,
    missing_fields,
    inconsistency_warnings,
  };
};
