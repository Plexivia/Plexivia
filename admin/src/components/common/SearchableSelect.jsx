import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Searchable single-select combobox.
 *
 * Replaces the plain `<select>` lists used for clients, employees and payment
 * methods: long lists stay usable because you type to filter, each row can show
 * a second line of detail, and the keyboard works (↑/↓/Enter/Esc).
 *
 * options: [{ value, label, description, badge, keywords }]
 */
export function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search…',
  emptyMessage = 'Nothing found',
  disabled = false,
  loading = false,
  clearable = true,
  className = '',
  buttonClassName = '',
  renderLeading = null,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => options.find((o) => String(o.value) === String(value)) || null, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      [o.label, o.description, o.badge, o.keywords]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [options, query]);

  // Close when clicking anywhere outside the control
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    setActiveIndex(Math.max(0, filtered.findIndex((o) => String(o.value) === String(value))));
    const timer = setTimeout(() => searchRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted row visible while arrowing through a long list
  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const commit = (option) => {
    setOpen(false);
    setQuery('');
    if (onChange) onChange(option ? option.value : '', option || null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) commit(option);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-left text-xs font-semibold text-foreground outline-none transition-colors',
          'hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer',
          buttonClassName
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {renderLeading ? renderLeading(selected) : null}
          <span className={cn('truncate', !selected && 'font-medium text-muted-foreground')}>
            {loading ? 'Loading…' : selected ? selected.label : placeholder}
          </span>
          {selected?.badge && (
            <span className="shrink-0 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {selected.badge}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          {clearable && selected && !disabled && !loading && (
            <span
              role="button"
              tabIndex={-1}
              title="Clear selection"
              onClick={(event) => {
                event.stopPropagation();
                commit(null);
              }}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(option)}
                    className={cn(
                      'flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors cursor-pointer',
                      index === activeIndex ? 'bg-muted' : 'bg-transparent',
                      isSelected && 'font-bold text-primary'
                    )}
                  >
                    <Check className={cn('mt-0.5 size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-foreground">{option.label}</span>
                      {option.description && (
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.badge && (
                      <span className="shrink-0 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {option.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
