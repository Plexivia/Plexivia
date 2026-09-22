import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Loader2,
  X,
  FileText,
  User,
} from 'lucide-react';
import { getStageConfig } from '@/constants/caseStages';

export function StageChangeConfirmModal({
  isOpen,
  onClose,
  currentStage,
  targetStage,
  caseData = {},
  onConfirm,
  loading = false,
}) {
  const currentCfg = getStageConfig(currentStage);
  const targetCfg = getStageConfig(targetStage);

  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (isOpen && targetCfg && currentCfg) {
      setRemarks(`Stage updated from ${currentCfg.title} to ${targetCfg.title}`);
    }
  }, [isOpen, targetCfg, currentCfg]);

  if (!isOpen) return null;

  const isCancelling = targetCfg.id === 'CANCELLED';
  const isDelivered = targetCfg.id === 'VISA_DELIVERED';

  const handleConfirm = () => {
    onConfirm(remarks);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-foreground animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isCancelling
                  ? 'bg-rose-500/15 text-rose-600'
                  : isDelivered
                  ? 'bg-emerald-500/15 text-emerald-600'
                  : 'bg-primary/15 text-primary'
              }`}
            >
              {isCancelling ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isDelivered ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">
                Confirm Stage Transition
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Verify lifecycle milestone advancement
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Case Identity Strip */}
          <div className="bg-muted/40 rounded-xl p-3 border border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-foreground">
                {caseData?.applicantName || caseData?.clientInfo?.fullName || caseData?.clientName || 'Candidate File'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>{caseData?.caseNumber || 'CASE-FILE'}</span>
            </div>
          </div>

          {/* Stage Comparison Flow */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
              Processing Stage Change
            </span>

            <div className="flex items-center justify-center gap-3 pt-1">
              {/* Current Stage */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">Current</span>
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs ${currentCfg.badgeClass}`}
                >
                  {currentCfg.title}
                </span>
              </div>

              {/* Arrow */}
              <div className="p-1.5 rounded-full bg-muted/60 text-muted-foreground mt-3">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Target Stage */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">New Target</span>
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs ${targetCfg.badgeClass}`}
                >
                  {targetCfg.title}
                </span>
              </div>
            </div>
          </div>

          {/* Warning / Notification Banner */}
          {isCancelling && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Warning: Case Cancellation</strong>
                <span>
                  Marking this file as Cancelled will halt active operations and archive pending workflow steps.
                </span>
              </div>
            </div>
          )}

          {isDelivered && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Milestone Completion</strong>
                <span>
                  Marking this case as Visa Delivered indicates all placement processes and physical passport delivery have been fulfilled.
                </span>
              </div>
            </div>
          )}

          {/* Optional Remarks Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">
              Operational Audit Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add audit note or reason for stage update..."
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none shadow-2xs"
            />
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-border bg-muted/20">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted/50 font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 ${targetCfg.solidClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Confirm &amp; Update</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StageChangeConfirmModal;
