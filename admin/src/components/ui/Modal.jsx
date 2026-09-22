import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-3xl',
  height = 'h-[70vh]',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Universal Modal Frame */}
      <div
        className={cn(
          'relative w-full bg-white text-black border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto transition-all transform animate-in zoom-in-95 duration-200',
          height,
          maxWidth,
          className
        )}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white shrink-0 select-none">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-black/60 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="size-4.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4 text-black">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-white border-t border-black/10 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
