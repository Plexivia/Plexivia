import React from 'react';
import { Columns, Edit3, Eye } from 'lucide-react';

export function StudioFloatingViewSwitcher({
  viewMode = 'edit',
  setViewMode,
  modes = [
    { id: 'edit', label: 'Edit Form', icon: Edit3 },
    { id: 'split', label: 'Split View', icon: Columns },
    { id: 'preview', label: 'Live Preview', icon: Eye },
  ],
  className = '',
}) {
  if (!setViewMode) return null;

  return (
    <div className={`fixed bottom-[20px] left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none print:hidden no-print ${className}`}>
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 text-black border border-black/15 shadow-2xl backdrop-blur-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
        {modes.map((btn) => {
          const Icon = btn.icon;
          const isActive = viewMode === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setViewMode(btn.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md font-black scale-105'
                  : 'text-black/60 hover:text-black hover:bg-black/[0.05]'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StudioFloatingViewSwitcher;
