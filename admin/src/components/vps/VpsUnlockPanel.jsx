import React, { useState } from 'react';
import { toast } from 'sonner';
import { KeyRound, Lock, Mail, QrCode, ShieldCheck, Smartphone } from 'lucide-react';
import { startEnrollment, sendEmailOtp, unlockWithPassword, verifyCode, vpsErrorMessage } from '@/services/vpsApi';
import { cn } from '@/lib/utils';

/**
 * The gate in front of the root console.
 *
 * Password first, then a code from an authenticator enrolled *for this console
 * only* — deliberately separate from the dashboard login 2FA, so root access
 * needs a factor that signing in did not already spend. On the first unlock the
 * operator picks how to receive the QR: shown here, or emailed to them. An
 * emailed one-time code is the fallback when the authenticator is unavailable.
 */

const CODE_LENGTH = 6;

const StepDot = ({ active, done, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
      done
        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
        : active
          ? 'bg-primary/15 text-primary'
          : 'bg-muted text-muted-foreground'
    )}
  >
    {children}
  </span>
);

const OptionButton = ({ icon: Icon, title, hint, onClick, busy, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className={cn(
      'flex flex-1 cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
      primary ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted'
    )}
  >
    <Icon className={cn('mt-0.5 size-4 shrink-0', primary ? 'text-primary' : 'text-muted-foreground')} />
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-foreground">{title}</span>
      <span className="block text-xs text-muted-foreground">{hint}</span>
    </span>
  </button>
);

const VpsUnlockPanel = ({ state, onUnlocked }) => {
  const [step, setStep] = useState('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('TOTP_AUTHENTICATOR');
  const [enrolled, setEnrolled] = useState(Boolean(state?.enrolled));
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!password) return;
    setBusy(true);
    try {
      const data = await unlockWithPassword(password);
      setEnrolled(Boolean(data?.enrolled));
      setMethod('TOTP_AUTHENTICATOR');
      setStep(data?.enrolled ? 'code' : 'enroll');
      setPassword('');
    } catch (error) {
      toast.error(vpsErrorMessage(error, 'Password verification failed.'));
    } finally {
      setBusy(false);
    }
  };

  const getQr = async (deliver) => {
    setBusy(true);
    try {
      const data = await startEnrollment(deliver);
      if (deliver === 'email') {
        setQr(null);
        toast.success(data?.email ? `QR code sent to ${data.email}.` : 'QR code emailed.');
      } else {
        setQr(data);
      }
      setMethod('TOTP_AUTHENTICATOR');
      setStep('code');
    } catch (error) {
      toast.error(vpsErrorMessage(error, 'Could not start authenticator setup.'));
    } finally {
      setBusy(false);
    }
  };

  const requestEmailOtp = async () => {
    setBusy(true);
    try {
      const data = await sendEmailOtp();
      setMethod('EMAIL_OTP');
      setQr(null);
      setStep('code');
      toast.success(data?.expiresInSeconds ? 'Unlock code sent. It expires in 3 minutes.' : 'Unlock code sent.');
    } catch (error) {
      toast.error(vpsErrorMessage(error, 'Could not send the unlock code.'));
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (event) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH) return;
    setBusy(true);
    try {
      await verifyCode(code, method);
      toast.success('Root console unlocked.');
      setCode('');
      setQr(null);
      onUnlocked?.();
    } catch (error) {
      toast.error(vpsErrorMessage(error, 'Verification failed.'));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 py-2">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Root console is locked</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Running commands as root needs your password and a code from the console authenticator — a second factor kept separate from your
          dashboard sign-in.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <StepDot active={step === 'password'} done={step !== 'password'}>
          1. Password
        </StepDot>
        <span className="text-muted-foreground">→</span>
        <StepDot active={step === 'enroll'} done={step === 'code'}>
          2. Authenticator
        </StepDot>
        <span className="text-muted-foreground">→</span>
        <StepDot active={step === 'code'}>3. Code</StepDot>
      </div>

      {state?.lockedOut && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
          Too many failed attempts. The console refuses new attempts for 10 minutes.
        </p>
      )}

      {/* Step 1 — password */}
      {step === 'password' && (
        <form onSubmit={submitPassword} className="space-y-3 rounded-xl border bg-card p-4">
          <label htmlFor="vps-password" className="block text-sm font-semibold text-foreground">
            Your dashboard password
          </label>
          <input
            id="vps-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy || !password}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound className="size-4" />
            {busy ? 'Verifying…' : 'Verify password'}
          </button>
        </form>
      )}

      {/* Step 2 — first-run authenticator setup */}
      {step === 'enroll' && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Set up the console authenticator</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              No authenticator is enrolled for the root console yet. Choose how to receive the QR code, scan it with your authenticator app, then
              enter the 6-digit code.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <OptionButton
              icon={QrCode}
              title="Show QR code here"
              hint="Scan it from this screen"
              onClick={() => getQr('inline')}
              busy={busy}
              primary
            />
            <OptionButton
              icon={Mail}
              title="Get QR code by email"
              hint="Sent to your admin email"
              onClick={() => getQr('email')}
              busy={busy}
            />
          </div>
          <button
            type="button"
            onClick={requestEmailOtp}
            disabled={busy}
            className="w-full cursor-pointer text-center text-xs font-medium text-primary hover:underline disabled:opacity-60"
          >
            Skip for now — email me a one-time unlock code instead
          </button>
        </div>
      )}

      {/* Step 3 — code entry */}
      {step === 'code' && (
        <form onSubmit={submitCode} className="space-y-4 rounded-xl border bg-card p-4">
          {qr?.qrDataUrl && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-center">
              <img
                src={qr.qrDataUrl}
                alt="Root console authenticator QR code"
                width={190}
                height={190}
                className="mx-auto rounded-lg border bg-white p-2"
              />
              <p className="text-xs text-muted-foreground">Can’t scan? Enter this key in your app:</p>
              <p className="break-all font-mono text-xs font-bold tracking-widest text-foreground">{qr.secretKey}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {method === 'EMAIL_OTP' ? <Mail className="size-4 text-primary" /> : <Smartphone className="size-4 text-primary" />}
            {method === 'EMAIL_OTP' ? 'Code from your email' : 'Code from your authenticator app'}
          </div>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            placeholder="000000"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-center font-mono text-xl font-bold tracking-[0.5em] outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={busy || code.length !== CODE_LENGTH}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="size-4" />
            {busy ? 'Verifying…' : 'Unlock root console'}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            {method !== 'EMAIL_OTP' && (
              <button type="button" onClick={requestEmailOtp} disabled={busy} className="cursor-pointer font-medium text-primary hover:underline disabled:opacity-60">
                Email me a code instead
              </button>
            )}
            {!enrolled && method === 'EMAIL_OTP' && (
              <button type="button" onClick={() => getQr('inline')} disabled={busy} className="cursor-pointer font-medium text-primary hover:underline disabled:opacity-60">
                Set up the authenticator
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStep('password');
                setCode('');
                setQr(null);
              }}
              className="cursor-pointer font-medium text-muted-foreground hover:underline"
            >
              Start over
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VpsUnlockPanel;
