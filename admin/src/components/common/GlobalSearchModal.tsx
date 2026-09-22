import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  BarChart3,
  Users,
  Layers,
  FolderKanban,
  Settings,
  Shield,
  FileText,
  ArrowRight,
  X,
  Command,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface SearchItem {
  title: string;
  path: string;
  desc: string;
  category: string;
  icon: React.ElementType;
}

export function GlobalSearchModal() {
  const navigate = useNavigate();
  const {
    isSearchModalOpen,
    setSearchModalOpen,
    searchQuery,
    setSearchQuery,
  } = useAppStore();

  // Keyboard shortcut listener (Ctrl+K or Cmd+K to toggle, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(!isSearchModalOpen);
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, setSearchModalOpen]);

  const searchItems: SearchItem[] = useMemo(
    () => [
      {
        title: 'Dashboard Overview',
        path: '/',
        desc: 'Metrics, live KPI cards, and recent records',
        category: 'Main',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics & Trends',
        path: '/analytics',
        desc: 'Revenue, system volume and growth charts',
        category: 'Main',
        icon: BarChart3,
      },
      {
        title: 'User Management',
        path: '/users',
        desc: 'Active staff, roles, and authorization levels',
        category: 'Management',
        icon: Users,
      },
      {
        title: 'Operations & Transactions',
        path: '/operations/transactions',
        desc: 'Financial records, settlements, and ledger',
        category: 'Management',
        icon: Layers,
      },
      {
        title: 'Audit Logs',
        path: '/operations/audit-logs',
        desc: 'System event trails and compliance history',
        category: 'Management',
        icon: Shield,
      },
      {
        title: 'Projects & Workflows',
        path: '/projects',
        desc: 'Kanban tasks and deployment pipelines',
        category: 'Management',
        icon: FolderKanban,
      },
      {
        title: 'Documentation',
        path: '/docs',
        desc: 'API guides, schemas, and template architecture',
        category: 'System',
        icon: FileText,
      },
      {
        title: 'System Settings',
        path: '/settings',
        desc: 'Branding, environment flags, and integrations',
        category: 'System',
        icon: Settings,
      },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return searchItems;
    const q = searchQuery.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchItems, searchQuery]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    setSearchModalOpen(false);
    setSearchQuery('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No results found for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/70 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Command className="w-3 h-3" />
            <span>Navigation shortcuts enabled</span>
          </div>
          <span>Plexivia Template</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;
