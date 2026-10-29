import { create } from 'zustand';
import { toast } from 'sonner';
import { API_BASE_URL, apiClient } from '@/lib/api-client';

export interface LiveNotification {
  _id: string;
  type: string;
  title: string;
  description: string;
  link: string;
  isRead: boolean;
  created_at: string;
}

type Listener = (event: string, data: any) => void;

interface NotificationState {
  notifications: LiveNotification[];
  unreadCount: number;
  connected: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  connected: false,

  fetch: async () => {
    try {
      const { data } = await apiClient.get('/api/v1/hub/notifications', { params: { limit: 30 } });
      set({ notifications: data?.data || [], unreadCount: data?.unreadCount || 0 });
    } catch {
      // Keep whatever the socket delivered
    }
  },

  markRead: async (id) => {
    const target = get().notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;
    set((s) => ({
      notifications: s.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    await apiClient.patch(`/api/v1/hub/notifications/${id}/read`).catch(() => {});
  },

  markAllRead: async () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 }));
    await apiClient.post('/api/v1/hub/notifications/read-all').catch(() => {});
  },
}));

// ---------------------------------------------------------------------------
// Live socket: one connection per tab, auto-reconnect with backoff
// ---------------------------------------------------------------------------

const listeners = new Set<Listener>();
let socket: WebSocket | null = null;
let retryTimer: number | null = null;
let attempts = 0;
let active = false;
const baseTitle = typeof document !== 'undefined' ? document.title : '';
let navigateTo: (to: string) => void = (to) => window.location.assign(to);

// Let the router handle links from toasts and desktop alerts (no full reload)
export const setRealtimeNavigate = (fn: (to: string) => void) => {
  navigateTo = fn;
};

// Subscribe to raw socket events (e.g. webmail:new); returns an unsubscribe function
export const subscribeRealtime = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const socketUrl = (token: string) => {
  const origin = API_BASE_URL || window.location.origin;
  return `${origin.replace(/^http/, 'ws').replace(/\/$/, '')}/api/ws?token=${encodeURIComponent(token)}`;
};

const updateTitle = (count: number) => {
  document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
};

// Show a toast and, when allowed and the tab is hidden, a desktop notification
const announce = (n: LiveNotification) => {
  toast.info(n.title, {
    description: n.description,
    action: n.link ? { label: 'Open', onClick: () => navigateTo(n.link) } : undefined,
  });
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    const desktop = new Notification(n.title, { body: n.description, tag: n._id });
    desktop.onclick = () => {
      window.focus();
      if (n.link) navigateTo(n.link);
    };
  }
};

const handleMessage = (raw: MessageEvent) => {
  let msg: { event: string; data: any };
  try {
    msg = JSON.parse(raw.data);
  } catch {
    return;
  }
  const { event, data } = msg;
  const store = useNotificationStore;

  if (event === 'init') {
    store.setState({ notifications: data?.notifications || [], unreadCount: data?.unreadCount || 0 });
  } else if (event === 'notification' && data?.notification) {
    store.setState((s) => ({
      notifications: [data.notification, ...s.notifications.filter((n) => n._id !== data.notification._id)].slice(0, 50),
      unreadCount: data.unreadCount ?? s.unreadCount + 1,
    }));
    announce(data.notification);
  } else if (event === 'notification:read') {
    store.setState((s) => ({
      notifications: s.notifications.map((n) => (data?.all || data?.ids?.includes(n._id) ? { ...n, isRead: true } : n)),
      unreadCount: data?.unreadCount ?? s.unreadCount,
    }));
  }

  listeners.forEach((l) => l(event, data));
};

const open = () => {
  const token = localStorage.getItem('accessToken');
  if (!active || !token) return;

  const ws = new WebSocket(socketUrl(token));
  socket = ws;
  ws.onopen = () => {
    attempts = 0;
    useNotificationStore.setState({ connected: true });
  };
  ws.onmessage = handleMessage;
  ws.onclose = () => {
    if (socket === ws) socket = null;
    useNotificationStore.setState({ connected: false });
    if (!active) return;
    // 1s, 2s, 4s ... capped at 30s; a refreshed token is picked up on the next try
    const delay = Math.min(30000, 1000 * 2 ** attempts++);
    retryTimer = window.setTimeout(open, delay);
  };
  ws.onerror = () => ws.close();
};

export const connectRealtime = () => {
  if (active) return;
  active = true;
  useNotificationStore.getState().fetch();
  open();
};

export const disconnectRealtime = () => {
  active = false;
  if (retryTimer) window.clearTimeout(retryTimer);
  retryTimer = null;
  socket?.close();
  socket = null;
};

// Keep the tab title in step with the unread count
useNotificationStore.subscribe((s) => updateTitle(s.unreadCount));
