// MEMEX-Reel Toast Component

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 2000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsLeaving(false);

      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 z-50
        px-5 py-3 rounded-xl
        bg-foreground text-background
        text-sm font-medium
        shadow-toast
        ${isLeaving ? 'animate-slide-down' : 'animate-slide-up'}
      `}
      style={{ transform: 'translateX(-50%)' }}
    >
      {message}
    </div>
  );
}
