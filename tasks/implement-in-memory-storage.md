# Implement In-Memory Storage

## Objective

Create the in-memory storage layer for persisting system documents during conversation lifetime.

## Tasks

1. Implement storage interface in `src/storage/in-memory.ts`
2. Use Map<string, SystemDoc> keyed by system_name
3. Provide methods:
   - `store(systemName: string, doc: SystemDoc): void`
   - `retrieve(systemName: string): SystemDoc | undefined`
   - `exists(systemName: string): boolean`
4. Handle atomic overwrites on successful validation
5. Thread-safe operations for concurrent access

## Acceptance Criteria

- [ ] In-memory Map storage implemented
- [ ] Atomic store/retrieve operations
- [ ] Proper key management by system_name
- [ ] No data persistence between server restarts (as specified)
- [ ] Type-safe storage interface
