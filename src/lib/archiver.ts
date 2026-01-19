// MEMEX-Reel Auto-Archiver
// Archives entries not accessed in 90 days

import { db } from './db';

const ARCHIVE_THRESHOLD_DAYS = 90;
const ARCHIVE_THRESHOLD_MS = ARCHIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
const ARCHIVE_INTERVAL_MS = 24 * 60 * 60 * 1000; // Run daily

let archiveTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the auto-archiver
 * Runs immediately then every 24 hours
 */
export async function startArchiver(): Promise<void> {
  // Run immediately
  await runArchive();
  
  // Then run daily
  archiveTimer = setInterval(runArchive, ARCHIVE_INTERVAL_MS);
}

/**
 * Stops the auto-archiver
 */
export function stopArchiver(): void {
  if (archiveTimer) {
    clearInterval(archiveTimer);
    archiveTimer = null;
  }
}

/**
 * Runs the archive process
 */
async function runArchive(): Promise<number> {
  const cutoff = Date.now() - ARCHIVE_THRESHOLD_MS;
  
  try {
    // Find and archive old entries
    const archivedCount = await db.entries
      .where('lastAccessedAt')
      .below(cutoff)
      .and(entry => !entry.archived)
      .modify({ archived: true });
    
    if (archivedCount > 0) {
      console.log(`[Archiver] Archived ${archivedCount} entries`);
      
      // Also update localStorage copies
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('entry-')) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '');
            if (entry.lastAccessedAt < cutoff && !entry.archived) {
              entry.archived = true;
              localStorage.setItem(key, JSON.stringify(entry));
            }
          } catch {
            // Skip corrupted entries
          }
        }
      }
    }
    
    // Persist last run time
    localStorage.setItem('lastArchiveRun', Date.now().toString());
    
    return archivedCount;
  } catch (error) {
    console.error('[Archiver] Error:', error);
    return 0;
  }
}
