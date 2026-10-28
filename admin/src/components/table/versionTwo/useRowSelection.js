import { useCallback, useState } from 'react';

// Selected row ids plus the toggle/setMany/clear handlers TableV2 expects for its `selection` prop
export function useRowSelection(initial = []) {
  const [ids, setIds] = useState(initial);

  const toggle = useCallback((id, checked) => {
    setIds((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
  }, []);

  const setMany = useCallback((pageIds, checked) => {
    setIds((prev) => (checked ? Array.from(new Set([...prev, ...pageIds])) : prev.filter((x) => !pageIds.includes(x))));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return { ids, setIds, toggle, setMany, clear };
}

export default useRowSelection;
