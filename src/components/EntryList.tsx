// MEMEX-Reel Entry List Component

import type { Entry } from '@/types/entry';
import { EntryCard } from './EntryCard';
import { Inbox } from 'lucide-react';

interface EntryListProps {
  entries: Entry[];
  loading: boolean;
  onToggleType: (entry: Entry) => void;
  onToggleItem: (entry: Entry, index: number) => void;
}

export function EntryList({ 
  entries, 
  loading, 
  onToggleType, 
  onToggleItem 
}: EntryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Aucune entrée
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Commencez à capturer vos pensées, listes et notes rapidement.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <EntryCard
            entry={entry}
            onToggleType={() => onToggleType(entry)}
            onToggleItem={(itemIndex) => onToggleItem(entry, itemIndex)}
          />
        </div>
      ))}
    </div>
  );
}
