# Loosen Zod Schema for Iterative Development

**Objective:** Modify the Zod schema in `src/schema.ts` to allow for partial and iterative updates to the systems-thinking model, as per the updated PRD.

**Key Changes:**

1.  **Make all top-level fields optional:** Update the main `SystemDoc` schema to make all its properties optional. This allows clients to submit just the fields they want to update.
2.  **Implement a deep partial:** The schema should still enforce the structure of the fields that *are* submitted. A simple `.partial()` might not be enough; a deep partial may be required.
3.  **Adjust validation logic:** The `gap-check.ts` logic will need to be updated to work with partial data, only validating the fields that are present in the request.
