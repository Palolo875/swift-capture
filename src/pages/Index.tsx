// MEMEX-Reel Main App Page

import { useState, useEffect, useCallback } from 'react';
import type { Entry } from '@/types/entry';
import { captureEntry, getActiveEntries, toggleEntryType, toggleChecklistItem } from '@/lib/capture';
import { startArchiver, stopArchiver } from '@/lib/archiver';
import { AppHeader } from '@/components/AppHeader';
import { CaptureInput } from '@/components/CaptureInput';
import { EntryList } from '@/components/EntryList';
import { Toast } from '@/components/Toast';

const Index = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Load entries on mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const loaded = await getActiveEntries();
        setEntries(loaded);
      } catch (error) {
        console.error('Failed to load entries:', error);
        showToast('❌ Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
    
    // Start archiver
    startArchiver();
    
    return () => {
      stopArchiver();
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleCapture = async (text: string) => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const entry = await captureEntry(text);
      
      // Optimistic UI update
      setEntries(prev => [entry, ...prev]);
      
      showToast('✓ Capturé');
    } catch (error) {
      console.error('Capture failed:', error);
      showToast('❌ Erreur - Réessayer');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleToggleType = async (entry: Entry) => {
    try {
      const updated = await toggleEntryType(entry);
      
      // Update UI
      setEntries(prev => 
        prev.map(e => e.id === entry.id ? updated : e)
      );
      
      showToast(`→ ${updated.type === 'checklist' ? 'Liste' : 'Note'}`);
    } catch (error) {
      console.error('Toggle type failed:', error);
      showToast('❌ Erreur');
    }
  };

  const handleToggleItem = async (entry: Entry, itemIndex: number) => {
    try {
      const updatedItems = await toggleChecklistItem(entry, itemIndex);
      
      // Update UI
      setEntries(prev => 
        prev.map(e => 
          e.id === entry.id 
            ? { ...e, items: updatedItems, lastAccessedAt: Date.now() }
            : e
        )
      );
    } catch (error) {
      console.error('Toggle item failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom safe-x">
      <div className="max-w-lg mx-auto px-4 pb-8">
        <AppHeader entryCount={entries.length} />
        
        {/* Capture input - sticky */}
        <div className="sticky top-0 z-10 pt-2 pb-4 bg-background">
          <CaptureInput 
            onCapture={handleCapture} 
            disabled={isCapturing}
          />
          
          {/* Swipe hint */}
          {entries.length > 0 && entries.length <= 3 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              ← Glissez pour changer le type
            </p>
          )}
        </div>
        
        {/* Entry list */}
        <EntryList
          entries={entries}
          loading={loading}
          onToggleType={handleToggleType}
          onToggleItem={handleToggleItem}
        />
      </div>
      
      {/* Toast notifications */}
      <Toast 
        message={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
};

export default Index;
