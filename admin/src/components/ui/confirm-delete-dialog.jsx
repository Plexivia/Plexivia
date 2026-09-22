import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, RotateCcw } from "lucide-react";

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure you want to delete this?",
  description = "This action cannot be undone. The selected data will be permanently removed.",
  confirmText = "Yes",
  cancelText = "NO",
  type = "delete", // 'delete' | 'reset'
  isDeleting = false,
}) {
  const isReset = type === "reset";

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isDeleting} className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-full ${isReset ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'}`}>
              {isReset ? <RotateCcw className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {title || (isReset ? "Are you sure you want to reset this?" : "Are you sure you want to delete this?")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isReset ? "This will revert your current inputs to their default values." : "Please confirm your action below."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* shadcn Alert Component */}
        <Alert variant={isReset ? "info" : "destructive"} className="my-2 text-xs">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle className="text-xs font-semibold">
            {isReset ? "Warning / Notice" : "Permanent Action"}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {description}
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2 sm:gap-2 flex-row justify-end">
          <Button
            type="button"
            variant="cancel"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-20 font-bold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={isReset ? "warning" : "destructive"}
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-20 font-bold"
          >
            {isDeleting ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
