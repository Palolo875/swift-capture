// MEMEX-Reel Database Layer - Dexie + IndexedDB

import Dexie, { type Table } from "dexie";
import { useQuery } from "@tanstack/react-query";
import type { Entry } from "@/types/entry";

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

export function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      try {
        return await db.entries
          .where("archived")
          .equals(0)
          .reverse()
          .sortBy("createdAt");
      } catch (error) {
        console.error("IndexedDB read failed, trying localStorage:", error);

        const entries: Entry[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("entry-")) {
            try {
              const entry = JSON.parse(localStorage.getItem(key) || "");
              if (!entry.archived) entries.push(entry);
            } catch {
              // skip
            }
          }
        }
        return entries.sort((a, b) => b.createdAt - a.createdAt);
      }
    },
  });
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  isOpen: boolean;
  entryCount: number;
}> {
  try {
    const count = await db.entries.count();
    return { isOpen: true, entryCount: count };
  } catch (error) {
    console.error("Database health check failed:", error);
    return { isOpen: false, entryCount: 0 };
  }
}
