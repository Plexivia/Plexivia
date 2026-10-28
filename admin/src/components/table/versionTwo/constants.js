// Shared styles for the version two table, pagination and toolbar (ported from the Surokkha dashboard)

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];

export const FILTER_CONTROL_CLASS =
  'inline-flex h-9 min-w-0 items-center justify-between gap-2 rounded-md border border-primary/70 bg-black/5 px-2.5 text-sm whitespace-nowrap shadow-xs transition-colors outline-none hover:border-primary hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-ring/40 data-[active=true]:border-primary sm:min-w-44 sm:px-3 dark:bg-zinc-800 dark:hover:bg-zinc-700';

export const PAGE_BUTTON_CLASS =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-primary/40 px-2 text-sm font-medium tabular-nums transition-colors outline-none hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-35 cursor-pointer';

export const PAGE_BUTTON_ACTIVE_CLASS =
  'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground';
