import React, { useState } from 'react';
import { X, Printer, FileCode, FileText, Check, Copy, Download, ExternalLink } from 'lucide-react';
import { printDocument } from '@/lib/utils';

export function ExportModal({ isOpen, onClose, documentTitle = 'Document', data = {}, elementId = 'printable-document-canvas' }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  // 1. Native A4 Vector PDF Print
  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      printDocument({
        docType: documentTitle,
        data,
        elementId,
      });
    }, 150);
  };

  // 2. Download JSON
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Download Standalone HTML
  const handleDownloadHtml = () => {
    const docElement = document.getElementById(elementId);
    if (!docElement) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${documentTitle} - Smart ERP Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 10mm; }
      body { margin: 0; padding: 0; background: white; }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen p-8 flex justify-center text-slate-900">
  <div class="w-full max-w-[850px] bg-white p-10 shadow-xl">
    ${docElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.toLowerCase().replace(/\s+/g, '-')}-printable.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 4. Copy Plain Text / Summary
  const handleCopyText = () => {
    const textContent = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white text-black border border-black/10 rounded-2xl max-w-lg w-full h-[70vh] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4 bg-black/[0.02] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">
                Export & Download Options
              </h2>
              <p className="text-xs text-black/60">
                Select export format for "{documentTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Export Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Option 1: Native Vector PDF Print */}
            <button
              onClick={handlePrint}
              className="flex items-start space-x-3 p-3.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-xs">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-black flex items-center gap-1">
                  Save to PDF / Print (A4)
                  <ExternalLink className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Crisp vector PDF output using browser A4 print engine.
                </p>
              </div>
            </button>

            {/* Option 2: Full Document Bundle PDF */}
            <button
              onClick={handleDownloadHtml}
              className="flex items-start space-x-3 p-3.5 bg-black/[0.02] hover:bg-black/[0.05] border border-black/10 rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-black">Download HTML File</div>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Self-contained printable webpage file.
                </p>
              </div>
            </button>

            {/* Option 3: JSON Data Schema */}
            <button
              onClick={handleDownloadJson}
              className="flex items-start space-x-3 p-3.5 bg-black/[0.02] hover:bg-black/[0.05] border border-black/10 rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-black">Download JSON Data</div>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Raw JSON format for backup & REST APIs.
                </p>
              </div>
            </button>

            {/* Option 4: Copy Plain Text */}
            <button
              onClick={handleCopyText}
              className="flex items-start space-x-3 p-3.5 bg-black/[0.02] hover:bg-black/[0.05] border border-black/10 rounded-xl text-left transition-all cursor-pointer"
            >
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold text-black">
                  {copiedText ? 'Copied Data!' : 'Copy Data Payload'}
                </div>
                <p className="text-[11px] text-black/60 mt-0.5">
                  Copy JSON payload to clipboard.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-3.5 border-t border-black/10 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-4 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
