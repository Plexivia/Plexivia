import React, { useState } from 'react';
import { KeyRound, LogOut, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore, RADIUS_OPTIONS } from '@/store/useThemeStore';

// Shared card and field styles taken from the TailAdmin profile layout
const cardClass = 'rounded-2xl border border-border p-5 lg:p-6';
const outlineButtonClass =
  'flex h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted cursor-pointer';

// Label/value pair used across the profile cards
const InfoField = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="w-full">
    <p className="mb-2 text-xs leading-normal text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || '—'}</p>
  </div>
);

// Row inside the Security and Danger Zone cards
const SettingRow = ({ title, description, action }: { title: string; description: string; action: React.ReactNode }) => (
  <div className="flex flex-col justify-between gap-4 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-end">
    <div>
      <span className="mb-1 block text-base font-medium text-foreground">{title}</span>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div>{action}</div>
  </div>
);

// Theme and corner-roundness controls; both are saved in this browser
const AppearanceCard = () => {
  const { theme, setTheme, radius, setRadius } = useThemeStore();
  const choice = (active: boolean) =>
    cn(
      'flex h-10 items-center justify-center gap-2 border px-4 text-sm font-medium transition-colors cursor-pointer rounded-lg',
      active ? 'border-sky-500 bg-sky-500 text-white' : 'border-input bg-card text-foreground hover:bg-muted'
    );
  return (
    <div className={cardClass}>
      <h4 className="mb-4 text-lg font-semibold text-foreground lg:mb-6">Appearance</h4>
      <SettingRow
        title="Theme"
        description="Switch between the light and dark dashboard."
        action={
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTheme(t)} className={choice(theme === t)}>
                {t === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        }
      />
      <SettingRow
        title="Corner roundness"
        description="Changes the border radius of cards, buttons, tables and inputs everywhere."
        action={
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((o) => (
              <button key={o.id} type="button" onClick={() => setRadius(o.id)} className={choice(radius === o.id)}>
                <span className="size-4 border-l-2 border-t-2 border-current" style={{ borderTopLeftRadius: o.value }} />
                {o.label}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
};

// Renders the signed-in user's profile overview
export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const [twoFactor, setTwoFactor] = useState(false);
  const u = (user || {}) as Record<string, any>;

  const displayName = u.fullName || u.name || 'User';
  const [firstName, ...rest] = String(displayName).split(' ');
  const avatar = u.avatar || u.avatarUrl || u.photoUrl;
  const role = String(u.role || '').toLowerCase();
  const designation = u.designation || u.subRole || u.sub_role || role;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-foreground lg:mb-7">Profile</h3>
      <div className="space-y-6">
        {/* Identity */}
        <div className={cardClass}>
          <div className="flex flex-col gap-5 sm:flex-row xl:gap-10">
            <div className="flex-1">
              <div className="mb-6 flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-primary">
                  {avatar ? <img src={avatar} alt="" className="size-20 object-cover" /> : displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h4 className="mb-2 text-lg font-semibold text-foreground">{displayName}</h4>
                  <div className="flex items-center gap-1 sm:gap-3">
                    <p className="text-sm capitalize text-muted-foreground">{designation}</p>
                    {u.email && (
                      <>
                        <div className="hidden h-3.5 w-px bg-border sm:block" />
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-11 xl:gap-y-7">
                <InfoField label="First Name" value={firstName} />
                <InfoField label="Last Name" value={rest.join(' ')} />
                <InfoField label="Email address" value={u.email} />
                <InfoField label="Phone" value={u.phone} />
                <InfoField label="Role" value={<span className="capitalize">{role}</span>} />
                <InfoField label="Designation" value={<span className="capitalize">{designation}</span>} />
              </div>
            </div>
            <div>
              <button type="button" className={cn(outlineButtonClass, 'w-full lg:w-auto')}>
                <Pencil className="size-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className={cardClass}>
          <div className="flex flex-col gap-6 sm:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h4 className="mb-4 text-lg font-semibold text-foreground lg:mb-6">Address</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <InfoField label="Country" value={u.country} />
                <InfoField label="City/State" value={u.city} />
                <InfoField label="Postal Code" value={u.postalCode} />
                <InfoField label="Address" value={u.address} />
              </div>
            </div>
            <div>
              <button type="button" className={cn(outlineButtonClass, 'w-full lg:w-auto')}>
                <Pencil className="size-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <AppearanceCard />

        {/* Security */}
        <div className={cardClass}>
          <h4 className="mb-4 text-lg font-semibold text-foreground lg:mb-6">Security</h4>
          <SettingRow
            title="Change Password"
            description="Update the password you use to sign in."
            action={
              <button type="button" className={outlineButtonClass}>
                <KeyRound className="size-4" />
                Change Password
              </button>
            }
          />
          <SettingRow
            title="Two-factor authentication (2FA)"
            description="Keep your account secure by enabling 2FA"
            action={
              <button
                type="button"
                role="switch"
                aria-checked={twoFactor}
                onClick={() => setTwoFactor((v) => !v)}
                className={cn('relative block h-5 w-9 rounded-full transition-colors cursor-pointer', twoFactor ? 'bg-primary' : 'bg-input')}
              >
                <span className={cn('absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform', twoFactor && 'translate-x-4')} />
              </button>
            }
          />
        </div>

        {/* Danger zone */}
        <div className={cardClass}>
          <h4 className="mb-4 text-lg font-semibold text-foreground lg:mb-6">Danger Zone</h4>
          <SettingRow
            title="Sign out"
            description="End your current session on this device."
            action={
              <button type="button" onClick={logout} className={cn(outlineButtonClass, 'hover:text-destructive')}>
                <LogOut className="size-4" />
                Sign out
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
};
