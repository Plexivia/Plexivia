import React from "react"
import { Toaster as Sonner } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      closeButton
      visibleToasts={4}
      duration={4000}
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-600 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-5 text-sky-600 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-rose-600 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-5 text-sky-600 animate-spin shrink-0" />
        ),
      }}
      style={{
        "--normal-bg": "#ffffff",
        "--normal-text": "#0f172a",
        "--normal-border": "#e2e8f0",
        "--success-bg": "#ffffff",
        "--success-text": "#0f172a",
        "--success-border": "#10b981",
        "--info-bg": "#ffffff",
        "--info-text": "#0f172a",
        "--info-border": "#0ea5e9",
        "--warning-bg": "#ffffff",
        "--warning-text": "#0f172a",
        "--warning-border": "#f59e0b",
        "--error-bg": "#ffffff",
        "--error-text": "#0f172a",
        "--error-border": "#f43f5e",
        "--border-radius": "16px",
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-slate-900 !rounded-2xl !p-4 !border-2 !border-slate-200 !shadow-[0_12px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)] flex items-start gap-3 select-none",
          title: "!text-slate-900 !font-bold !text-[13px] !tracking-tight",
          description: "!text-slate-600 !text-xs !leading-relaxed !mt-0.5",
          actionButton: "!bg-sky-600 !text-white !font-bold !text-xs !rounded-xl !px-3 !py-1.5 shadow-xs",
          cancelButton: "!bg-red-500/10 !text-red-600 !border !border-red-500/30 hover:!bg-red-500/20 !font-semibold !text-xs !rounded-xl !px-3 !py-1.5",
          closeButton:
            "!left-auto !right-0 !top-0 !translate-x-[35%] !-translate-y-[35%] !opacity-100 !bg-white !text-red-500 !border !border-red-300 hover:!bg-red-50 hover:!text-red-600 !shadow-md !size-6 !rounded-full !flex !items-center !justify-center transition-all",
          info:
            "!bg-white !border-sky-500 !shadow-[0_12px_32px_rgba(14,165,233,0.22),0_4px_12px_rgba(14,165,233,0.12)] [&>svg]:!text-sky-600",
          success:
            "!bg-white !border-emerald-500 !shadow-[0_12px_32px_rgba(16,185,129,0.22),0_4px_12px_rgba(16,185,129,0.12)] [&>svg]:!text-emerald-600",
          warning:
            "!bg-white !border-amber-500 !shadow-[0_12px_32px_rgba(245,158,11,0.22),0_4px_12px_rgba(245,158,11,0.12)] [&>svg]:!text-amber-600",
          error:
            "!bg-white !border-rose-500 !shadow-[0_12px_32px_rgba(244,63,94,0.22),0_4px_12px_rgba(244,63,94,0.12)] [&>svg]:!text-rose-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
