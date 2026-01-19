// MEMEX-Reel Core Types

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

export type EntryType = 'note' | 'checklist';

export interface Entry {
  id: string;
  rawText: string;
  type: EntryType;
  items?: ChecklistItem[];
  createdAt: number;
  lastAccessedAt: number;
  archived: boolean;
}

// For creating new entries
export type NewEntryInput = Pick<Entry, 'rawText'>;
