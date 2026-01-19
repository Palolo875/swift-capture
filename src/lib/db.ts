// MEMEX-Reel Database Layer - Dexie + IndexedDB

import Dexie, { type Table } from 'dexie';
import type { Entry } from '@/types/entry';

class MemexDatabase extends Dexie {
  entries!: Table<Entry, string>;

  constructor() {
    super('memex-reel');
    
    this.version(1).stores({
      // Index on id, archived status, and lastAccessedAt for archiving queries
      entries: 'id, archived, lastAccessedAt, createdAt'
    });
  }
}

export const db = new MemexDatabase();

// Health check function
export async function checkDatabaseHealth(): Promise<{
  isOpen: boolean;
  entryCount: number;
}> {
  try {
    const count = await db.entries.count();
    return { isOpen: true, entryCount: count };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { isOpen: false, entryCount: 0 };
  }
}
