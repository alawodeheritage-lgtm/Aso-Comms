// src/components/Modal.tsx
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showImages?: boolean;
  images?: (string | { url: string; publicId?: string; originalName?: string })[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showImages = false,
  images = []
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl'
  };

  const getImageUrl = (img: string | { url: string; publicId?: string; originalName?: string }): string => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') return img.url || '';
    return '';
  };

  const getImageName = (img: string | { url: string; publicId?: string; originalName?: string }): string => {
    if (typeof img === 'string') {
      const parts = img.split('/');
      return parts[parts.length - 1] || 'Image';
    }
    if (img && typeof img === 'object') {
      return img.originalName || 'Image';
    }
    return 'Image';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto border border-slate-200/80`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="text-lg font-display font-bold text-[#1A365D]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 hover:text-[#1A365D]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {showImages && images && images.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Attached Images ({images.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, index) => {
                  const imageUrl = getImageUrl(img);
                  const imageName = getImageName(img);
                  if (!imageUrl) return null;
                  return (
                    <a
                      key={index}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:shadow-md transition-all"
                    >
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image failed to load:', imageUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50';
                            fallback.innerHTML = `
                              <span class="material-symbols-outlined text-4xl">broken_image</span>
                              <span class="text-xs mt-1 truncate max-w-full px-2">${imageName}</span>
                            `;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs truncate block">{imageName}</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;