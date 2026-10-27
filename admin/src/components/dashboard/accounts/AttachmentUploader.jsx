import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx',
];

// Formats file size in bytes into human-readable KB or MB string
const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Checks whether an attachment file object is an image based on extension
const isImage = (file) => /\.(jpe?g|png|webp|gif|heic)$/i.test(file.url || file.name || '');

// Renders document and image attachment uploader for bills and payments
export const AttachmentUploader = ({ kind, value = [], onChange }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Validates selected files and prepares attachment list (API integration placeholder: POST /api/v1/accounts/attachments/:kind)
  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    if (value.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files`);
      return;
    }

    setUploading(true);
    let next = [...value];
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`${file.name}: file type not allowed`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name}: larger than 5 MB`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      next = [
        ...next,
        {
          name: file.name,
          url: previewUrl,
          size: file.size,
          mimeType: file.type,
          kind,
        },
      ];
    }
    setUploading(false);
    onChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  // Removes an attachment from the current list (API integration placeholder: DELETE /api/v1/accounts/attachments/:kind/:folder/:filename)
  const removeFile = async (file) => {
    onChange(value.filter((f) => f.url !== file.url));
  };

  // Triggers file input click when dropzone button is clicked
  const handleTriggerClick = () => {
    inputRef.current?.click();
  };

  // Prevents default browser drag over behavior on the dropzone
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handles files dropped onto the attachment dropzone
  const handleDrop = (e) => {
    e.preventDefault();
    uploadFiles(e.dataTransfer.files);
  };

  // Handles file selection from the native file input
  const handleInputChange = (e) => {
    uploadFiles(e.target.files);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
        className="hidden"
        onChange={handleInputChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={handleTriggerClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full rounded-lg border-2 border-dashed bg-muted/20 hover:bg-muted/40 transition-colors px-4 py-5 flex flex-col items-center gap-1 text-center cursor-pointer disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <UploadCloud className="w-5 h-5 text-primary" />
        )}
        <span className="text-xs font-semibold text-foreground">
          {uploading ? 'Uploading...' : 'Click or drop files to upload'}
        </span>
        <span className="text-[11px] text-muted-foreground">
          Images, PDF, Word, Excel, CSV, TXT · max 5 MB per file
        </span>
      </button>

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((file) => (
            <li key={file.url} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
              {isImage(file) ? (
                <ImageIcon className="w-4 h-4 shrink-0 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 shrink-0 text-amber-500" />
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate font-medium text-foreground hover:underline"
                title={file.name}
              >
                {file.name || file.url.split('/').pop()}
              </a>
              <span className="text-[11px] text-muted-foreground shrink-0">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="text-muted-foreground hover:text-destructive cursor-pointer"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentUploader;
