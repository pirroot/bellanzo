'use client';

import { useState } from 'react';
import { ImageIcon, ZoomIn } from 'lucide-react';
import Lightbox from './Lightbox,';

interface ProductImageProps {
  imageSrc: string | null;
  alt: string;
}

export default function ProductImage({ imageSrc, alt }: ProductImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className="relative aspect-square rounded-3xl bg-surface border border-line overflow-hidden group cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={alt} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={70} className="text-line" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            size={40}
          />
        </div>
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={imageSrc}
        alt={alt}
      />
    </>
  );
}
