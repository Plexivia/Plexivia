import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  Printer,
  ShieldCheck,
  Calendar,
  User,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Eye,
  File,
  Image as ImageIcon,
} from 'lucide-react';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'https://api.plexivia.com';

/**
 * Normalizes file URLs to handle relative paths, legacy dev server hosts, and Cloudflare R2 endpoints
 */
export function normalizeFileUrl(fileUrl = '') {
  if (!fileUrl || typeof fileUrl !== 'string') return '';
  const trimmed = fileUrl.trim();

  // 1. Data URLs and Blobs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. Localhost URLs stored in database -> Redirect to live API domain
  if (trimmed.startsWith('http://localhost:') || trimmed.startsWith('http://127.0.0.1:')) {
    return trimmed.replace(/^https?:\/\/[^/]+/, API_BASE_URL);
  }

  // 3. HTTP live domain -> Upgrade to HTTPS
  if (trimmed.startsWith('http://api.plexivia.com')) {
    return trimmed.replace('http://', 'https://');
  }

  // 4. Absolute URLs (Cloudflare R2 or HTTPS)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 5. Relative paths (/uploads/...) -> prepend API_BASE_URL
  const cleanBase = API_BASE_URL || 'https://api.plexivia.com';
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Helper to determine file category based on URL or mime type
 */
export function getFileTypeInfo(fileUrl = '', mimeType = '', fileName = '') {
  const urlLower = String(fileUrl || '').toLowerCase();
  // Strip query string for extension matching
  const urlPath = urlLower.split('?')[0].split('#')[0];
  const nameLower = String(fileName || '').toLowerCase();
  const mimeLower = String(mimeType || '').toLowerCase();

  const isDataImage = urlLower.startsWith('data:image/');
  const isDataPdf = urlLower.startsWith('data:application/pdf');

  if (
    isDataImage ||
    mimeLower.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico)$/i.test(urlPath) ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico)$/i.test(nameLower)
  ) {
    return { type: 'image', label: 'Image Scan', isImage: true, isPdf: false };
  }

  if (
    isDataPdf ||
    mimeLower.includes('pdf') ||
    urlPath.endsWith('.pdf') ||
    nameLower.endsWith('.pdf') ||
    urlPath.includes('/pdf')
  ) {
    return { type: 'pdf', label: 'PDF Document', isImage: false, isPdf: true };
  }

  if (
    mimeLower.includes('text') ||
    /\.(txt|md|csv|json|log)$/i.test(urlPath) ||
    /\.(txt|md|csv|json|log)$/i.test(nameLower)
  ) {
    return { type: 'text', label: 'Text Document', isImage: false, isPdf: false };
  }

  return { type: 'other', label: 'Other Document', isImage: false, isPdf: false };
}

/**
 * FileViewer
 * Core visual rendering container for a file
 */
export function FileViewer({ file, className = '' }) {
  const rawUrl = file?.fileUrl || file?.url || file?.fileData || file?.src || (typeof file === 'string' ? file : '');
  const resolvedUrl = normalizeFileUrl(rawUrl);
  const resolvedName = file?.documentName || file?.fileName || file?.name || file?.title || 'Document Preview';
  const resolvedType = file?.fileType || file?.mimeType || '';

  const { isImage, isPdf } = getFileTypeInfo(resolvedUrl, resolvedType, resolvedName);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(!resolvedUrl);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setLoading(true);
    setHasError(!resolvedUrl);
  }, [resolvedUrl]);

  if (!resolvedUrl || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3 bg-muted/20 border border-border rounded-2xl ${className}`}>
        <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-xs">
          <AlertCircle className="size-7 opacity-90" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">{resolvedName}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Unable to load preview directly from storage. The file may be in local storage or require direct download.
          </p>
        </div>
        {resolvedUrl && (
          <div className="flex items-center gap-2 pt-2">
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary/20 transition cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
              <span>Open in New Tab</span>
            </a>
            <a
              href={resolvedUrl}
              download={resolvedName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition cursor-pointer border border-border"
            >
              <Download className="size-3.5" />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // 1. IMAGE PREVIEW
  if (isImage) {
    return (
      <div className={`relative flex items-center justify-center overflow-auto p-4 select-none min-h-[360px] max-h-[70vh] bg-neutral-900/90 rounded-xl ${className}`}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/70 z-10 space-y-2">
            <RefreshCw className="size-6 text-sky-400 animate-spin" />
            <span className="text-xs text-neutral-300">Loading image...</span>
          </div>
        )}
        <img
          src={resolvedUrl}
          alt={resolvedName}
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="max-w-full max-h-[65vh] object-contain shadow-2xl rounded-lg pointer-events-auto"
        />
      </div>
    );
  }

  // 2. PDF PREVIEW
  if (isPdf) {
    return (
      <div className={`relative w-full h-[68vh] bg-neutral-900 rounded-xl overflow-hidden shadow-inner ${className}`}>
        <iframe
          src={`${resolvedUrl}#toolbar=1&navpanes=0`}
          title={resolvedName}
          className="w-full h-full border-0 rounded-xl bg-white"
          onLoad={() => setLoading(false)}
        />
      </div>
    );
  }

  // 3. OTHER ATTACHMENT FALLBACK
  return (
    <div className={`flex flex-col items-center justify-center p-12 bg-muted/20 border border-border rounded-2xl text-center space-y-4 ${className}`}>
      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
        <File className="size-8" />
      </div>
      <div>
        <h4 className="font-bold text-sm text-foreground">{resolvedName}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {file?.fileSize || 'Attached File'} • Direct inline preview unavailable for this format
        </p>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <a
          href={resolvedUrl}
          download={resolvedName}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>Download Attachment</span>
        </a>
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition cursor-pointer border border-border"
        >
          <ExternalLink className="size-3.5" />
          <span>Open in New Tab</span>
        </a>
      </div>
    </div>
  );
}

/**
 * FileViewerModal
 * Complete standalone popup modal with header tools, zoom controls, download, print, and audit strip
 */
export function FileViewerModal({
  isOpen = false,
  onClose,
  file = null,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);

  const rawUrl = file?.fileUrl || file?.url || file?.fileData || file?.src || (typeof file === 'string' ? file : '');
  const resolvedUrl = normalizeFileUrl(rawUrl);
  const resolvedName = file?.documentName || file?.fileName || file?.name || file?.title || 'Document File';
  const resolvedType = file?.fileType || file?.mimeType || '';
  const resolvedSize = file?.fileSize || file?.size || '';
  const uploaderName = file?.uploadedByName || file?.uploader || 'Staff Member';
  const uploadDate = file?.uploadedAt || file?.createdAt || null;
  const isVerified = file?.verified !== false;

  const { isImage, isPdf, label } = getFileTypeInfo(resolvedUrl, resolvedType, resolvedName);

  // Keyboard shortcut handler (Escape to close, +/- to zoom)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (isImage && (e.key === '+' || e.key === '=')) {
        setZoom((prev) => Math.min(prev + 0.25, 3));
      } else if (isImage && (e.key === '-' || e.key === '_')) {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (isImage && (e.key === 'r' || e.key === 'R')) {
        setRotation((prev) => (prev + 90) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isImage]);

  // Reset controls on modal open or file change
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsFullscreen(false);
      setLoading(true);
      setHasError(!resolvedUrl);
      setRetryIndex(0);
    }
  }, [isOpen, file, resolvedUrl]);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handlePrint = () => {
    if (isImage && !hasError && resolvedUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Print ${resolvedName}</title></head>
            <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;">
              <img src="${resolvedUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else if (resolvedUrl) {
      window.open(resolvedUrl, '_blank')?.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div
        className={`bg-card border border-border rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-4xl h-[70vh]'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border bg-muted/30 select-none">
          {/* Title & Document Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center font-bold shrink-0 border border-sky-500/30">
              {isImage ? <Eye className="size-5" /> : isPdf ? <FileText className="size-5" /> : <FileCheck className="size-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-md" title={resolvedName}>
                  {resolvedName}
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-700 border border-sky-500/30">
                  {label}
                </span>
                {isVerified && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                    Verified ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {resolvedSize ? `${resolvedSize} • ` : ''}Uploaded by <strong>{uploaderName}</strong>
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {isImage && !hasError && (
              <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl shadow-2xs mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[11px] font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Rotate 90° (R)"
                >
                  <RotateCw className="size-4" />
                </button>
              </div>
            )}

            {resolvedUrl && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 bg-background border border-border hover:bg-muted text-foreground rounded-xl shadow-2xs transition cursor-pointer"
                  title="Print Document"
                >
                  <Printer className="size-4" />
                </button>

                <a
                  href={resolvedUrl}
                  download={resolvedName}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-background border border-border hover:bg-muted text-foreground rounded-xl shadow-2xs transition cursor-pointer"
                  title="Download File"
                >
                  <Download className="size-4" />
                </a>

                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-background border border-border hover:bg-muted text-foreground rounded-xl shadow-2xs transition cursor-pointer"
                  title="Open in New Tab"
                >
                  <ExternalLink className="size-4" />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-background border border-border hover:bg-muted text-foreground rounded-xl shadow-2xs transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 rounded-xl shadow-2xs transition cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (PREVIEW CANVAS) */}
        <div className="flex-1 overflow-auto p-4 bg-muted/10 flex items-center justify-center min-h-[380px]">
          {isImage ? (
            hasError ? (
              <div className="flex flex-col items-center justify-center p-8 max-w-md w-full bg-card border border-border rounded-2xl text-center space-y-4 shadow-md my-auto">
                <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-xs">
                  <AlertCircle className="size-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">Image Preview Unavailable</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    The document file could not be rendered inline directly from the server.
                  </p>
                  {resolvedUrl && (
                    <div className="text-[10px] font-mono text-muted-foreground break-all bg-muted/40 p-2 rounded-lg mt-2 border border-border select-all max-h-16 overflow-y-auto">
                      {resolvedUrl}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasError(false);
                      setLoading(true);
                      setRetryIndex((prev) => prev + 1);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Retry Load</span>
                  </button>
                  {resolvedUrl && (
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition cursor-pointer border border-border"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Open Link</span>
                    </a>
                  )}
                  {resolvedUrl && (
                    <a
                      href={resolvedUrl}
                      download={resolvedName}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition cursor-pointer border border-border"
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative flex items-center justify-center overflow-auto w-full h-full min-h-[380px] select-none">
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 backdrop-blur-2xs z-10 space-y-2 rounded-xl">
                    <RefreshCw className="size-6 text-sky-500 animate-spin" />
                    <span className="text-xs font-semibold text-muted-foreground">Loading preview...</span>
                  </div>
                )}
                <img
                  key={retryIndex}
                  src={resolvedUrl}
                  alt={resolvedName}
                  referrerPolicy="no-referrer"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setHasError(true);
                  }}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                  className={`max-w-full max-h-[70vh] object-contain shadow-2xl rounded-xl border border-border/40 transition-opacity duration-200 ${
                    loading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>
            )
          ) : isPdf ? (
            <div className="w-full h-full min-h-[68vh] rounded-xl overflow-hidden border border-border shadow-inner bg-white">
              <iframe
                src={`${resolvedUrl}#toolbar=1&navpanes=0`}
                title={resolvedName}
                className="w-full h-full border-0"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setHasError(true);
                }}
              />
            </div>
          ) : (
            <FileViewer file={file} className="w-full max-w-lg" />
          )}
        </div>

        {/* MODAL FOOTER AUDIT STRIP */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              Uploaded by: <strong className="text-foreground">{uploaderName}</strong>
            </span>
            {uploadDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                Date:{' '}
                <strong className="text-foreground">
                  {new Date(uploadDate).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;
