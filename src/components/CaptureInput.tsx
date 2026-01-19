// MEMEX-Reel Capture Input Component

import { useRef, useEffect } from 'react';

interface CaptureInputProps {
  onCapture: (text: string) => void;
  disabled?: boolean;
}

export function CaptureInput({ onCapture, disabled = false }: CaptureInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const text = inputRef.current?.value.trim();
    if (!text) return;
    
    onCapture(text);
    
    // Clear and refocus
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Capture rapide..."
        disabled={disabled}
        autoComplete="off"
        autoFocus
        className="
          w-full px-5 py-4
          text-lg
          bg-card text-card-foreground
          placeholder:text-muted-foreground
          border-2 border-border
          rounded-xl
          shadow-card
          transition-all duration-200
          focus:outline-none focus:border-primary focus:shadow-elevated
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
    </form>
  );
}
