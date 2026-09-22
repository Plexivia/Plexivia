import React, { useEffect } from 'react';
import {
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  CreditCard,
  X,
  CheckCircle2,
  Folder,
  Lock,
  MapPin,
} from 'lucide-react';

/**
 * ExistingClientAlertModal
 *
 * Strict Yes/No un-dismissible blocking modal shown when a phone
 * matches an existing client record in the database.
 *
 * Behavior:
 * - Backdrop clicks / clicks outside do NOTHING (modal will not close)
 * - Esc key is intercepted and disabled
 * - Only Yes and No buttons can close/resolve the modal
 * - "Yes" -> auto-fill form with client data
 * - "No"  -> reset the phone field so user can enter a new number
 */
export function ExistingClientAlertModal({ client, caseFile = null, onYes, onNo }) {
  // Prevent Escape key from closing the modal
  useEffect(() => {
    if (!client) return;
    const blockEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockEscape, true);
    return () => window.removeEventListener('keydown', blockEscape, true);
  }, [client]);

  if (!client) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200 overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white text-black border border-black/10 shadow-2xl rounded-2xl max-w-lg w-full h-[70vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-black/10 px-6 py-4 bg-black/[0.02] shrink-0">
          <div className="p-3 bg-amber-500/15 text-amber-600 rounded-xl shrink-0 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-black">
                There is an existing client with this number!
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-700 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Lock className="w-3 h-3" />
                Match Found
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1">
              Do you want to use this client's information?
            </p>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Matched Client Card */}
          <div className="bg-black/[0.02] border border-black/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-black leading-tight">
                    {client.name || client.fullName || 'Client'}
                  </h4>
                  {client.clientCode && (
                    <span className="text-[10px] font-mono text-black/60">
                      Code: {client.clientCode}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Verified Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-black/10 text-xs">
              {client.phone && (
                <div className="flex items-center gap-2 text-black/80 font-mono">
                  <Phone className="size-3.5 text-primary shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.passportNumber && (
                <div className="flex items-center gap-2 text-black/80 font-mono">
                  <CreditCard className="size-3.5 text-primary shrink-0" />
                  <span>{client.passportNumber}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-black/80 truncate col-span-full">
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.presentAddress && (
                <div className="flex items-start gap-2 text-black/80 col-span-full">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{client.presentAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Open Case File (if exists) */}
          {caseFile && (
            <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-2 bg-sky-500/5 border border-sky-500/20 p-2.5 rounded-lg">
              <Folder className="w-4 h-4 text-sky-500 shrink-0" />
              <div>
                <p className="text-[10px] text-black/60 font-semibold">Active Case File</p>
                <p className="font-bold text-sky-600 text-xs">
                  #{caseFile.caseNumber || caseFile._id} — {caseFile.destinationCountry || caseFile.caseType || 'Active Case'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 px-6 py-3.5 border-t border-black/10 bg-white shrink-0">
          {/* NO */}
          <button
            type="button"
            onClick={onNo}
            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>No, Different Number</span>
          </button>

          {/* YES */}
          <button
            type="button"
            onClick={onYes}
            className="flex items-center justify-center gap-2 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes, Use This Client</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExistingClientAlertModal;

