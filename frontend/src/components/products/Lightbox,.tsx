'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  alt?: string;
}

export default function Lightbox({ isOpen, onClose, imageSrc, alt = '' }: LightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-brand transition-colors z-10"
        aria-label="بستن"
      >
        <X size={36} />
      </button>
      <img
        src={imageSrc}
        alt={alt || 'تصویر'}
        className="max-w-full max-h-full object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
