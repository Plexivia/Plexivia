import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BanknoteArrowUp, FileSpreadsheet, Receipt, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Asked right after "Add Payment" on a client row: what should be produced?
 *
 * - Money received  → a money receipt (the payment slip handed to the client)
 * - Not received yet → an invoice (the bill asking for it)
 *
 * Either choice opens Document Studio with that client already filled in.
 */
const CHOICES = [
  {
    id: 'receipt',
    path: '/documents/receipt',
    icon: Receipt,
    title: 'Payment received — make a slip',
    subtitle: 'Money Receipt Voucher',
    description: 'The money is in hand. Issues a receipt for the client, with amount in words, method and signatures.',
    accent: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
    iconClass: 'bg-emerald-500/15 text-emerald-700',
  },
  {
    id: 'invoice',
    path: '/documents/invoice',
    icon: FileSpreadsheet,
    title: 'Payment not received — make an invoice',
    subtitle: 'Invoice & Billing',
    description: 'Bill the client first. Itemised charges, VAT, due date and payment status.',
    accent: 'border-sky-500/30 bg-sky-500/5 hover:border-sky-500/60',
    iconClass: 'bg-sky-500/15 text-sky-700',
  },
  {
    id: 'payment',
    path: '/accounts/payments/new',
    icon: Wallet,
    title: 'Only record it in Accounts',
    subtitle: 'Add Payment entry',
    description: 'Books the money against this client without producing a printable document.',
    accent: 'border-border bg-muted/30 hover:border-primary/50',
    iconClass: 'bg-muted text-foreground',
  },
];

export function ClientPaymentActionModal({ client, onClose }) {
  const navigate = useNavigate();
  const isOpen = Boolean(client);

  const clientName = client?.business_name || client?.client_name || 'this client';

  const handleChoose = (choice) => {
    if (!client) return;
    const params = new URLSearchParams({ clientId: client.id });
    if (choice.id === 'payment') {
      // The Accounts form reads the client from its own query parameter
      navigate(`${choice.path}?clientId=${encodeURIComponent(client.id)}`);
    } else {
      navigate(`${choice.path}?${params.toString()}`);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <BanknoteArrowUp className="size-5" />
            <DialogTitle className="text-base font-bold">Add payment for {clientName}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            What do you want to do? Pick a slip if the money has already come in, or an invoice if it has not.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-2.5">
          {CHOICES.map((choice) => {
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleChoose(choice)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${choice.accent}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${choice.iconClass}`}>
                  <Icon className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{choice.title}</span>
                    <span className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {choice.subtitle}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{choice.description}</span>
                </span>
                <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClientPaymentActionModal;
