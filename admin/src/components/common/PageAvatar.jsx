import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE_URL } from '@/lib/api-client';

// Module-level cache to prevent duplicate requests across components
let usersCache = null;
let usersPromise = null;

async function fetchAllUsers() {
  if (usersCache) return usersCache;
  if (usersPromise) return usersPromise;

  usersPromise = apiClient.get('/api/v1/admin/users')
    .then((res) => {
      const usersList = res.data?.data || res.data?.users || [];
      const map = {};
      usersList.forEach((u) => {
        const did = u.did || u._id;
        if (did) {
          map[did] = {
            name: u.fullName || u.name || 'User',
            email: u.email || '',
            role: u.role || 'Staff',
            avatar: u.avatar || '',
          };
        }
      });
      usersCache = map;
      return map;
    })
    .catch((err) => {
      console.warn('[PageAvatar] Failed to pre-fetch users cache:', err);
      usersPromise = null;
      return {};
    });

  return usersPromise;
}

export function PageAvatar({
  did,
  showAvatarOnly = false,
  showTitle = true,
  showEmail = false,
  showRole = false,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  fallbackName = 'User',
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!did) {
      setLoading(false);
      return;
    }

    if (usersCache && usersCache[did]) {
      setUser(usersCache[did]);
      setLoading(false);
      return;
    }

    fetchAllUsers().then((map) => {
      if (map[did]) {
        setUser(map[did]);
      }
      setLoading(false);
    });
  }, [did]);

  const name = user?.name || fallbackName;
  const email = user?.email || '';
  const role = user?.role || '';
  let avatarUrl = user?.avatar;

  if (avatarUrl) {
    if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://') && !avatarUrl.startsWith('data:')) {
      const base = API_BASE_URL.replace(/\/+$/, '');
      const path = avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl;
      avatarUrl = `${base}${path}`;
    }
  } else {
    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true&rounded=true`;
  }

  const sizeClasses = {
    sm: 'size-6 text-[10px]',
    md: 'size-8 text-xs',
    lg: 'size-10 text-sm',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 animate-pulse ${className}`}>
        <div className={`rounded-xl bg-muted shrink-0 ${selectedSize}`} />
        {!showAvatarOnly && (
          <div className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded" />
            {(showEmail || showRole) && <div className="h-2.5 w-24 bg-muted rounded" />}
          </div>
        )}
      </div>
    );
  }

  const avatarEl = (
    <div className={`rounded-xl overflow-hidden bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center shadow-xs ${selectedSize}`}>
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`;
        }}
      />
    </div>
  );

  if (showAvatarOnly) {
    return avatarEl;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {avatarEl}
      <div className="flex flex-col min-w-0">
        {showTitle && (
          <span className="font-bold text-foreground block text-xs truncate">
            {name}
          </span>
        )}
        {showEmail && email && (
          <span className="font-mono text-[10px] text-muted-foreground truncate">
            {email}
          </span>
        )}
        {showRole && role && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            {role}
          </span>
        )}
      </div>
    </div>
  );
}

export default PageAvatar;
