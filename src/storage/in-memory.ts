// In-memory Map-based document storage
// Provides basic persistence for the lifetime of the Node process.
// This layer is intentionally simple: FastMCP runs single-threaded so
// synchronous Map operations are effectively atomic.

import { SystemDoc } from '../schema';

export interface Storage {
  store(systemName: string, doc: SystemDoc): void;
  retrieve(systemName: string): SystemDoc | undefined;
  exists(systemName: string): boolean;
}

/**
 * Simple in-memory storage backed by a Map keyed by system name.
 * Data is lost when the server restarts.
 */
export class InMemoryStorage implements Storage {
  private storeMap = new Map<string, SystemDoc>();

  /** Store or overwrite a document for the given system name. */
  store(systemName: string, doc: SystemDoc): void {
    this.storeMap.set(systemName, doc);
  }

  /** Retrieve the document for a system, if present. */
  retrieve(systemName: string): SystemDoc | undefined {
    return this.storeMap.get(systemName);
  }

  /** Check whether a document exists for the given system name. */
  exists(systemName: string): boolean {
    return this.storeMap.has(systemName);
  }
}

export const storage = new InMemoryStorage();
