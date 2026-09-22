import React, { useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';

/**
 * UnifiedModalHeader
 * Clean, standardized light/dark modal header with red close button.
 */
export function UnifiedModalHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  onClose,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  const resolvedSubtitle = subtitle || description;

  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-black/10 bg-white flex items-center justify-between shrink-0 select-none relative z-10',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            {React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className={cn(
                'text-base sm:text-lg font-bold text-black tracking-tight',
                titleClassName
              )}
            >
              {title}
            </h2>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
          </div>
          {resolvedSubtitle && (
            <p
              className={cn(
                'text-xs text-black/60 mt-0.5 font-medium truncate max-w-xl',
                subtitleClassName
              )}
            >
              {resolvedSubtitle}
            </p>
          )}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
          aria-label="Close modal"
          title="Close"
        >
          <X className="size-4.5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}

/**
 * UnifiedModalBody
 * Scrollable content container with internal padding.
 */
export function UnifiedModalBody({ children, className = '' }) {
  return (
    <div className={cn('p-6 overflow-y-auto flex-1 bg-white text-black', className)}>
      {children}
    </div>
  );
}

/**
 * UnifiedModalFooter
 * Clean, standardized action footer with Previous, Cancel and Action buttons.
 */
export function UnifiedModalFooter({
  // Previous step action
  onPrevious,
  previousText = 'Previous Step',
  previousIcon = ChevronLeft,
  showPrevious = false,
  previousButton = null,
  // Cancel action
  onCancel,
  cancelText = 'Cancel',
  cancelButton = null,
  showCancel = true,
  // Submit / Primary action
  onSubmit,
  submitText = 'Confirm',
  loadingText,
  submitIcon = CheckCircle2,
  loading = false,
  disabled = false,
  submitButton = null,
  submitVariant = 'primary',
  children,
  className = '',
}) {
  return (
    <div
      className={cn(
        'px-6 py-3.5 border-t border-black/10 bg-white flex items-center justify-between shrink-0 gap-3',
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          {/* Left Side: Previous Step / Secondary slot */}
          <div>
            {showPrevious &&
              (previousButton || (
                <Button
                  type="button"
                  variant="previous"
                  onClick={onPrevious}
                  disabled={loading}
                  icon={previousIcon}
                  className="cursor-pointer"
                >
                  {previousText}
                </Button>
              ))}
          </div>

          {/* Right Side: Cancel & Submit buttons */}
          <div className="flex items-center gap-2.5">
            {showCancel &&
              (cancelButton || (
                <Button
                  type="button"
                  variant="cancel"
                  onClick={onCancel}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {cancelText}
                </Button>
              ))}

            {submitButton || (
              <Button
                type={onSubmit ? 'button' : 'submit'}
                onClick={onSubmit}
                disabled={loading || disabled}
                variant={submitVariant}
                icon={loading ? Loader2 : submitIcon}
                className={cn('cursor-pointer font-bold', loading && '[&_svg]:animate-spin')}
              >
                {loading ? loadingText || submitText : submitText}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * UnifiedModal / Universal Modal Component
 * Fixed 70% viewport height (h-[70vh]), fixed width, scrollable content body,
 * and unified color scheme across both Client and Admin dashboards.
 */
export function UnifiedModal({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  icon,
  badge,
  children,
  stepper = null,
  maxWidth = 'max-w-3xl',
  height = 'h-[70vh]',
  // Footer Props
  footer = null,
  onPrevious,
  previousText = 'Previous Step',
  showPrevious = false,
  onCancel,
  cancelText = 'Cancel',
  showCancel = true,
  onSubmit,
  submitText = 'Confirm',
  loadingText,
  submitIcon = CheckCircle2,
  submitVariant = 'primary',
  loading = false,
  disabled = false,
  showFooter = true,
  // Custom class overrides
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) {
  const bodyRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white text-black border border-black/10 rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200',
          height,
          maxWidth,
          className
        )}
      >
        {/* Fixed Header */}
        <UnifiedModalHeader
          title={title}
          subtitle={subtitle || description}
          icon={icon}
          badge={badge}
          onClose={onClose}
          className={headerClassName}
        />

        {/* Optional Stepper / Progress Bar (Fixed) */}
        {stepper && <div className="shrink-0">{stepper}</div>}

        {/* Internal Scrollable Content Body */}
        <div ref={bodyRef} className={cn('flex-1 min-h-0 overflow-y-auto p-6 space-y-4 text-black', bodyClassName)}>
          {children}
        </div>

        {/* Fixed Action Footer */}
        {showFooter &&
          (footer || (
            <UnifiedModalFooter
              onPrevious={onPrevious}
              previousText={previousText}
              showPrevious={showPrevious}
              onCancel={onCancel || onClose}
              cancelText={cancelText}
              showCancel={showCancel}
              onSubmit={onSubmit}
              submitText={submitText}
              loadingText={loadingText}
              submitIcon={submitIcon}
              submitVariant={submitVariant}
              loading={loading}
              disabled={disabled}
              className={footerClassName}
            />
          ))}
      </div>
    </div>
  );
}

export default UnifiedModal;
