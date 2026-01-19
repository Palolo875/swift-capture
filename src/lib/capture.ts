// MEMEX-Reel Capture & Storage Logic

import { db } from './db';
import { detectType, extractItems } from './detection';
import type { Entry, ChecklistItem } from '@/types/entry';

const MAX_TEXT_LENGTH = 10000;

/**
 * Captures a new entry with redundant storage
 */
export async function captureEntry(rawText: string): Promise<Entry> {
  // Validation
  const trimmedText = rawText.trim();
  
  if (!trimmedText || trimmedText.length === 0) {
    throw new Error('Texte vide');
  }
  
  if (trimmedText.length > MAX_TEXT_LENGTH) {
    throw new Error(`Texte trop long (max ${MAX_TEXT_LENGTH} caractères)`);
  }
  
  // Detect type and extract items
  const type = detectType(trimmedText);
  const items = type === 'checklist' ? extractItems(trimmedText) : undefined;
  
  // Create entry
  const entry: Entry = {
    id: crypto.randomUUID(),
    rawText: trimmedText,
    type,
    items,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    archived: false
  };
  
  // Redundant save: IndexedDB + localStorage
  const results = await Promise.allSettled([
    db.entries.add(entry),
    Promise.resolve(
      localStorage.setItem(`entry-${entry.id}`, JSON.stringify(entry))
    )
  ]);
  
  // Check at least one save succeeded
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  if (successCount === 0) {
    throw new Error('Échec de sauvegarde');
  }
  
  // Warn if partial save
  if (successCount === 1) {
    console.warn('Sauvegarde partielle:', results);
  }
  
  return entry;
}

/**
 * Updates an existing entry
 */
export async function updateEntry(
  id: string, 
  updates: Partial<Pick<Entry, 'type' | 'items' | 'rawText' | 'archived'>>
): Promise<void> {
  const updatedData = {
    ...updates,
    lastAccessedAt: Date.now()
  };
  
  // Update both storages
  await Promise.allSettled([
    db.entries.update(id, updatedData),
    (async () => {
      const stored = localStorage.getItem(`entry-${id}`);
      if (stored) {
        const entry = JSON.parse(stored);
        localStorage.setItem(`entry-${id}`, JSON.stringify({ ...entry, ...updatedData }));
      }
    })()
  ]);
}

/**
 * Toggles entry type between note and checklist
 */
export async function toggleEntryType(entry: Entry): Promise<Entry> {
  const newType = entry.type === 'note' ? 'checklist' : 'note';
  const newItems = newType === 'checklist' ? extractItems(entry.rawText) : undefined;
  
  await updateEntry(entry.id, { type: newType, items: newItems });
  
  return {
    ...entry,
    type: newType,
    items: newItems,
    lastAccessedAt: Date.now()
  };
}

/**
 * Toggles a checklist item
 */
export async function toggleChecklistItem(
  entry: Entry, 
  itemIndex: number
): Promise<ChecklistItem[] | undefined> {
  if (!entry.items || itemIndex < 0 || itemIndex >= entry.items.length) {
    return entry.items;
  }
  
  const updatedItems = [...entry.items];
  updatedItems[itemIndex] = {
    ...updatedItems[itemIndex],
    checked: !updatedItems[itemIndex].checked
  };
  
  await updateEntry(entry.id, { items: updatedItems });
  
  return updatedItems;
}

/**
 * Gets all non-archived entries
 */
export async function getActiveEntries(): Promise<Entry[]> {
  try {
    // Try IndexedDB first
    const entries = await db.entries
      .where('archived')
      .equals(0)
      .reverse()
      .sortBy('createdAt');
    
    return entries;
  } catch (error) {
    console.error('IndexedDB read failed, trying localStorage:', error);
    
    // Fallback to localStorage
    const entries: Entry[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('entry-')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          if (!entry.archived) {
            entries.push(entry);
          }
        } catch {
          // Skip corrupted entries
        }
      }
    }
    
    return entries.sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Archives an entry
 */
export async function archiveEntry(id: string): Promise<void> {
  await updateEntry(id, { archived: true });
}
