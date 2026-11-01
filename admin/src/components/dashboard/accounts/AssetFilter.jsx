import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useData } from '@/context/DataContext';

// Assets are projects; a record with no project is Plexivia's own spend/income
export const ALL_ASSETS = 'All';
export const NO_ASSET = '__none__';

// White-label stores live in their own collection; loaded once and shared by every asset dropdown
let whiteLabelRequest = null;
const loadWhiteLabelProjects = () => {
  whiteLabelRequest ||= apiFetch('/agency/whitelabel-ecommerce')
    .then((res) => (Array.isArray(res?.data) ? res.data : []))
    .catch(() => {
      whiteLabelRequest = null;
      return [];
    });
  return whiteLabelRequest;
};

// Projects and white-label stores as asset options, labelled with their client so same-named ones stay apart
export const useAssetOptions = () => {
  const { projects, clients } = useData();
  const [whiteLabel, setWhiteLabel] = useState([]);

  useEffect(() => {
    let active = true;
    loadWhiteLabelProjects().then((list) => active && setWhiteLabel(list));
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const options = (Array.isArray(projects) ? projects : []).map((p) => ({
      id: p.id,
      name: p.project_name || p.name || p.project_code || p.id,
      clientId: p.client_id || '',
      clientName: p.is_internal ? 'Internal' : p.client_name || '',
    }));
    const seen = new Set(options.map((o) => o.id));
    for (const w of whiteLabel) {
      if (!w.dId || seen.has(w.dId)) continue;
      const client = (Array.isArray(clients) ? clients : []).find((c) => c.id === w.clientDId);
      options.push({ id: w.dId, name: w.name, clientId: w.clientDId || '', clientName: client?.business_name || 'White-label store' });
    }
    return options;
  }, [projects, clients, whiteLabel]);
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
