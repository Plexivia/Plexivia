import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useData } from '@/context/DataContext';

// Assets are projects; a record with no project is Plexivia's own spend/income
export const ALL_ASSETS = 'All';
export const NO_ASSET = '__none__';

// Projects as asset options, labelled with their client so same-named projects stay apart
export const useAssetOptions = () => {
  const { projects } = useData();
  return useMemo(
    () =>
      (Array.isArray(projects) ? projects : []).map((p) => ({
        id: p.id,
        name: p.project_name || p.name || p.project_code || p.id,
        clientId: p.client_id || '',
        clientName: p.is_internal ? 'Internal' : p.client_name || '',
      })),
    [projects]
  );
};

// True when a record's projectId passes the selected asset filter
export const matchesAsset = (assetFilter, projectId) => {
  if (assetFilter === ALL_ASSETS) return true;
  if (assetFilter === NO_ASSET) return !projectId;
  return projectId === assetFilter;
};

// Dropdown that narrows a list to one asset
export const AssetFilter = ({ value, onChange, className = 'h-9 text-xs w-[190px]' }) => {
  const assets = useAssetOptions();
  const selected = assets.find((a) => a.id === value);
  const label = value === ALL_ASSETS ? 'All' : value === NO_ASSET ? 'Plexivia (no asset)' : selected?.name || 'Unknown';

  return (
    <Select value={value} onValueChange={(v) => onChange(v || ALL_ASSETS)}>
      <SelectTrigger className={className}>
        <span className="truncate">Asset: {label}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_ASSETS}>All Assets</SelectItem>
        <SelectItem value={NO_ASSET}>Plexivia (no asset)</SelectItem>
        {assets.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name}
            {a.clientName ? ` · ${a.clientName}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Totals strip under a table; always reflects the rows currently passing the filters
export const FilteredTotals = ({ count, items }) => (
  <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 border-t bg-muted/30 px-4 py-2.5 text-xs">
    <span className="mr-auto text-muted-foreground">
      Totals for <span className="font-semibold text-foreground">{count}</span> filtered record{count === 1 ? '' : 's'}
    </span>
    {items.map((item) => (
      <span key={item.label} className="text-muted-foreground">
        {item.label}: <span className={`font-bold tabular-nums ${item.className || 'text-foreground'}`}>{item.value}</span>
      </span>
    ))}
  </div>
);
