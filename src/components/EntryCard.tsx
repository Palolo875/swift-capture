// MEMEX-Reel Entry Card Component

import { useRef, useState } from 'react';
import type { Entry, ChecklistItem } from '@/types/entry';
import { Check, FileText, ListChecks } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
  onToggleType: () => void;
  onToggleItem: (index: number) => void;
}

export function EntryCard({ entry, onToggleType, onToggleItem }: EntryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Only allow left swipe
    setOffsetX(Math.min(0, diff));
  };

  const handleTouchEnd = () => {
    if (offsetX < -80) {
      // Trigger type toggle
      onToggleType();
    }
    setOffsetX(0);
    setIsSwiping(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className="
        relative overflow-hidden
        bg-card rounded-xl shadow-card
        transition-transform duration-200
        active:scale-[0.98]
      "
      style={{
        transform: `translateX(${offsetX}px)`,
        transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe hint background */}
      <div 
        className="
          absolute inset-y-0 right-0 w-24
          bg-accent flex items-center justify-center
          transition-opacity duration-200
        "
        style={{ opacity: Math.min(1, Math.abs(offsetX) / 80) }}
      >
        {entry.type === 'note' ? (
          <ListChecks className="w-6 h-6 text-accent-foreground" />
        ) : (
          <FileText className="w-6 h-6 text-accent-foreground" />
        )}
      </div>

      {/* Card content */}
      <div className="relative bg-card p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {entry.type === 'checklist' ? (
              <ListChecks className="w-5 h-5 text-primary" />
            ) : (
              <FileText className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {entry.type === 'checklist' ? 'Liste' : 'Note'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(entry.createdAt)}
          </span>
        </div>

        {/* Content */}
        {entry.type === 'checklist' && entry.items ? (
          <ChecklistContent items={entry.items} onToggle={onToggleItem} />
        ) : (
          <NoteContent text={entry.rawText} />
        )}
      </div>
    </div>
  );
}

function NoteContent({ text }: { text: string }) {
  return (
    <p className="text-base text-card-foreground leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}

function ChecklistContent({ 
  items, 
  onToggle 
}: { 
  items: ChecklistItem[];
  onToggle: (index: number) => void;
}) {
  const checkedCount = items.filter(i => i.checked).length;
  
  return (
    <div className="space-y-1">
      {/* Progress indicator */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-300 rounded-full"
              style={{ width: `${(checkedCount / items.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {checkedCount}/{items.length}
          </span>
        </div>
      )}
      
      {/* Items */}
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={index}
            className="
              flex items-center gap-3 py-2 px-1
              cursor-pointer select-none
              rounded-lg transition-colors
              hover:bg-muted/50 active:bg-muted
            "
            onClick={() => onToggle(index)}
          >
            <div 
              className={`
                w-5 h-5 rounded-md border-2 flex items-center justify-center
                transition-all duration-200
                ${item.checked 
                  ? 'bg-success border-success' 
                  : 'border-border bg-background'
                }
              `}
            >
              {item.checked && (
                <Check className="w-3.5 h-3.5 text-success-foreground" />
              )}
            </div>
            <span 
              className={`
                flex-1 text-base transition-all duration-200
                ${item.checked 
                  ? 'line-through text-muted-foreground' 
                  : 'text-card-foreground'
                }
              `}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
