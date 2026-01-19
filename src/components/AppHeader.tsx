// MEMEX-Reel App Header

import { Zap } from 'lucide-react';

interface AppHeaderProps {
  entryCount: number;
}

export function AppHeader({ entryCount }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            MEMEX
          </h1>
          <p className="text-xs text-muted-foreground -mt-0.5">
            Capture rapide
          </p>
        </div>
      </div>
      
      {entryCount > 0 && (
        <div className="px-3 py-1.5 bg-muted rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">
            {entryCount} {entryCount === 1 ? 'entrée' : 'entrées'}
          </span>
        </div>
      )}
    </header>
  );
}
