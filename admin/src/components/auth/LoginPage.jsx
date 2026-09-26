import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  QrCode,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useAuth as useDefaultAuth } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api-client';
import { handleGlobalError } from '@/lib/error-handler';
import { toast } from 'sonner';
import plexiviaLogo from '@/assets/brand-dark.png';

// Format seconds to mm:ss display
const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Render multi-step admin authentication portal
export const LoginPage = ({
  portalType = 'admin',
  portalTitle = 'Plexivia Dashboard',
  logoSrc = plexiviaLogo,
  useAuthHook = useDefaultAuth,
}) => {
  const {
    user,
    checkEmail,
    verifyPassword,
    sendEmailOtp,
    verify2fa,
    resendEmailOtp,
    sendQrCodeEmail,
    isLoading: isAuthLoading,
  } = useAuthHook();
  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [is2faSubmitting, setIs2faSubmitting] = useState(false);
  const [isSendingQr, setIsSendingQr] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetTimer, setResetTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  useEffect(() => {
    let timer;
    if (resetTimer > 0) {
      timer = setTimeout(() => setResetTimer((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      const targetPath = location.state?.from?.pathname || '/';
      navigate(targetPath, { replace: true });
    }
  }, [user, isAuthLoading, navigate, location.state]);

  // Dispatch credential recovery notification to administrator
  const handleForgotCredentials = async () => {
    try {
      const targetEmail = email.trim() || 'Unspecified';
      await apiClient.post('/api/v1/auth/forgot-credentials-notify', { email: targetEmail });
      toast.success('Your credential recovery request has been dispatched to the administrator.');
    } catch {
      toast.success('Your credential recovery request has been dispatched to the administrator.');
    }
  };

  // Handle email verification step 1
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await checkEmail(cleanEmail);
      if (res?.success) {
        setViewMode('password');
        toast.success('Account found. Please enter your password.');
      }
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password verification step 2
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyPassword(email.trim(), password);
      if (res?.requires2fa || res?.success) {
        setTwoFactorToken(res?.twoFactorToken || '');
        setTwoFactorEmail(res?.email || email.trim());
        setTwoFactorCode('');
        setViewMode('2fa_verify');
        setTwoFactorMethod('email');
        setOtpTimer(180);
        await sendEmailOtp(email.trim(), res?.twoFactorToken);
        toast.info('Verification code sent to your email (valid for 3 minutes).');
      }
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch 2FA method
  const handleSelectMethod = async (method) => {
    setTwoFactorMethod(method);
    setTwoFactorCode('');
    if (method === 'email') {
      if (otpTimer <= 0) {
        setIsSendingOtp(true);
        try {
          await sendEmailOtp(twoFactorEmail || email.trim(), twoFactorToken);
          setOtpTimer(180);
          toast.success('Verification code dispatched to your email.');
        } catch (err) {
          handleGlobalError(err);
        } finally {
          setIsSendingOtp(false);
        }
      }
    }
  };

  // Handle 2FA verification submission
  const handleVerify2fa = async (e) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }

    if (twoFactorMethod === 'email' && otpTimer === 0) {
      toast.error('Your verification code has expired. Please request a new code.');
      return;
    }

    setIs2faSubmitting(true);
    try {
      await verify2fa({
        twoFactorToken,
        code: twoFactorCode.trim(),
        method: twoFactorMethod,
        email: twoFactorEmail || email.trim(),
      });
      toast.success('Two-factor authentication verified successfully.');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIs2faSubmitting(false);
    }
  };

  // Handle manual resend of email OTP
  const handleResendOtp = async () => {
    if (isSendingOtp || otpTimer > 0) return;
    setIsSendingOtp(true);
    try {
      await resendEmailOtp(twoFactorToken);
      setOtpTimer(180);
      setTwoFactorCode('');
      toast.success('A new 6-digit verification code has been sent (valid for 3 minutes).');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Dispatch QR code instructions to user email
  const handleGetQrCodeEmail = async () => {
    if (isSendingQr) return;
    setIsSendingQr(true);
    try {
      const res = await sendQrCodeEmail(twoFactorToken);
      toast.success(res?.message || 'Authenticator QR code has been emailed to you.');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsSendingQr(false);
    }
  };

  // Request password reset verification code
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/auth/forgot-password', { email: targetEmail });
      setResetEmail(targetEmail);
      toast.success(res.data?.message || 'Verification code sent to your email.');
      setViewMode('forgot_reset');
      setResetTimer(180);
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsResetSubmitting(false);
    }
  };

  // Complete password reset with code and new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match. Please verify.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await apiClient.post('/api/v1/auth/reset-password', {
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });

      toast.success(res.data?.message || 'Password reset successfully!');
      setViewMode('forgot_success');
      setEmail(resetEmail.trim());
      setPassword('');
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setIsResetSubmitting(false);
    }
  };

  if (isAuthLoading && user) {
    return (
      <div className="dark min-h-screen w-screen bg-[#09090b] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <div className="h-9 w-9 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">
          Authenticating secure session...
        </span>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen w-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none opacity-30" />
      <div className="absolute top-1/4 left-1/3 w-[220px] h-[220px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10 my-auto"
      >
        <div className="h-[60vh] bg-[#121214]/95 shadow-2xl backdrop-blur-2xl rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto scrollbar-primary border-none border-0">
          <div className="h-14 shrink-0 flex items-center justify-center">
            <img
              src={logoSrc}
              alt="Plexivia Logo"
              className="h-10 sm:h-11 w-auto max-w-[200px] object-contain select-none"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center py-2">
            <AnimatePresence mode="wait">
              {viewMode === 'email' && (
                <motion.form
                  key="email-step-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleEmailSubmit}
                  className="flex flex-col justify-between h-full gap-4"
                >
                  <div className="space-y-1.5 text-left my-auto">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="username email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 h-10 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                        placeholder="name@example.com"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    <button
                      type="button"
                      onClick={handleForgotCredentials}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <KeyRound className="h-4 w-4 mr-1.5 text-zinc-400" />
                      <span>Forgot your credentials?</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99] disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                      )}
                      <span>{isSubmitting ? 'Checking Account…' : 'Continue'}</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {viewMode === 'password' && (
                <motion.form
                  key="password-step-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handlePasswordSubmit}
                  className="flex flex-col justify-between h-full gap-4"
                >
                  <div className="space-y-3.5 text-left my-auto">
                    <div className="flex items-center justify-between p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-zinc-200 truncate">{email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewMode('email')}
                        className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 h-10 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                          placeholder="••••••••"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setViewMode('forgot_request');
                      }}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <KeyRound className="h-4 w-4 mr-1.5 text-zinc-400" />
                      <span>Forgot Password?</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99] disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-1.5" />
                      )}
                      <span>{isSubmitting ? 'Verifying Password…' : 'Sign In'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('email')}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-red-600 hover:bg-red-500 text-white border border-red-500 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/25 active:scale-[0.99]"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {viewMode === '2fa_verify' && (
                <motion.form
                  key="2fa-verify-step-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleVerify2fa}
                  className="flex flex-col justify-between h-full gap-3"
                  autoComplete="off"
                >
                  <div className="space-y-2.5 my-auto">
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#09090b] border border-zinc-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleSelectMethod('email')}
                        className={`h-8 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          twoFactorMethod === 'email'
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Mail className="size-3.5" />
                        <span>Email OTP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectMethod('authenticator')}
                        className={`h-8 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          twoFactorMethod === 'authenticator'
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Smartphone className="size-3.5" />
                        <span>Authenticator</span>
                      </button>
                    </div>

                    {twoFactorMethod === 'email' && (
                      <div className="space-y-2">
                        <div className="text-left bg-[#09090b] border border-sky-900/40 rounded-xl p-2.5 text-xs text-zinc-300 font-medium shadow-inner flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-[11px]">Code sent to:</span>
                            <div className="flex items-center gap-1 font-mono text-[11px] text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/40">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimer(otpTimer)}</span>
                            </div>
                          </div>
                          <span className="font-bold text-sky-200 truncate text-xs">{twoFactorEmail || email}</span>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="block text-xs font-semibold text-zinc-300">
                            6-Digit Email Code
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                              <KeyRound className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              maxLength={6}
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-10 pr-3.5 h-10 text-sm font-mono tracking-widest bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all text-center font-bold"
                              placeholder="123456"
                              autoFocus
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {twoFactorMethod === 'authenticator' && (
                      <div className="space-y-2">
                        <div className="text-left bg-[#09090b] border border-sky-900/40 rounded-xl p-2.5 text-xs text-sky-400 font-medium shadow-inner">
                          Enter the current 6-digit code generated in your Authenticator or TOTP app.
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="block text-xs font-semibold text-zinc-300">
                            Authenticator Code
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                              <Smartphone className="h-4 w-4" />
                            </span>
                            <input
                              type="text"
                              maxLength={6}
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-10 pr-3.5 h-10 text-sm font-mono tracking-widest bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all text-center font-bold"
                              placeholder="123456"
                              autoFocus
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    {twoFactorMethod === 'email' ? (
                      <button
                        type="button"
                        disabled={isSendingOtp || otpTimer > 0}
                        onClick={handleResendOtp}
                        className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-40"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin text-zinc-300" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1.5 text-zinc-400" />
                        )}
                        <span>
                          {isSendingOtp
                            ? 'Sending OTP…'
                            : otpTimer > 0
                            ? `Resend OTP in ${formatTimer(otpTimer)}`
                            : 'Resend OTP'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSendingQr}
                        onClick={handleGetQrCodeEmail}
                        className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
                      >
                        {isSendingQr ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin text-zinc-300" />
                        ) : (
                          <QrCode className="h-4 w-4 mr-1.5 text-zinc-400" />
                        )}
                        <span>{isSendingQr ? 'Sending QR Code…' : 'Send QR Code'}</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={is2faSubmitting || (twoFactorMethod === 'email' && otpTimer === 0)}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99] disabled:opacity-50"
                    >
                      {is2faSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 mr-1.5" />
                      )}
                      <span>{is2faSubmitting ? 'Verifying…' : 'Verify & Continue'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('password');
                        setTwoFactorCode('');
                      }}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-red-600 hover:bg-red-500 text-white border border-red-500 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/25 active:scale-[0.99]"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {viewMode === 'forgot_request' && (
                <motion.form
                  key="forgot-request-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRequestResetOtp}
                  className="flex flex-col justify-between h-full gap-4"
                  autoComplete="off"
                >
                  <div className="space-y-3 text-left my-auto">
                    <div className="text-left bg-[#09090b] border border-sky-900/40 rounded-xl p-3 text-xs text-sky-400 font-medium leading-relaxed shadow-inner">
                      Enter your registered account email address. We will send a secure 6-digit verification code to reset your password.
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          name="forgot_email"
                          autoComplete="off"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 h-10 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    <button
                      type="button"
                      onClick={handleForgotCredentials}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <KeyRound className="h-4 w-4 mr-1.5 text-zinc-400" />
                      <span>Contact Administrator</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isResetSubmitting}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99] disabled:opacity-60"
                    >
                      {isResetSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <KeyRound className="h-4 w-4 mr-1.5" />
                      )}
                      <span>{isResetSubmitting ? 'Sending Code…' : 'Send Verification Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('password')}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-red-600 hover:bg-red-500 text-white border border-red-500 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/25 active:scale-[0.99]"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {viewMode === 'forgot_reset' && (
                <motion.form
                  key="forgot-reset-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleResetPassword}
                  className="flex flex-col justify-between h-full gap-3"
                  autoComplete="off"
                >
                  <div className="space-y-2.5 text-left my-auto">
                    <div className="text-left bg-[#09090b] border border-sky-900/40 rounded-xl p-2.5 text-xs text-sky-400 font-medium shadow-inner">
                      <span>Code sent to: </span>
                      <span className="font-bold text-sky-200 block truncate">{resetEmail}</span>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-semibold text-zinc-300">
                        6-Digit Code
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                          <KeyRound className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          maxLength={6}
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-10 pr-3.5 h-10 text-sm font-mono tracking-widest bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all text-center font-bold"
                          placeholder="123456"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-semibold text-zinc-300">
                        New Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-10 h-10 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                          placeholder="Min 6 characters"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 h-10 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-500 focus:outline-hidden focus:bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/20 transition-all font-medium"
                          placeholder="Repeat new password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    <button
                      type="button"
                      disabled={resetTimer > 0 || isResetSubmitting}
                      onClick={handleRequestResetOtp}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-40"
                    >
                      <RefreshCw className="h-4 w-4 mr-1.5 text-zinc-400" />
                      <span>{resetTimer > 0 ? `Resend Code in ${resetTimer}s` : 'Resend Code'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isResetSubmitting}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99] disabled:opacity-60"
                    >
                      {isResetSubmitting ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <KeyRound className="h-4 w-4 mr-1.5" />
                      )}
                      <span>{isResetSubmitting ? 'Updating Password…' : 'Reset & Save Password'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('password')}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-red-600 hover:bg-red-500 text-white border border-red-500 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/25 active:scale-[0.99]"
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {viewMode === 'forgot_success' && (
                <motion.div
                  key="forgot-success-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col justify-between h-full py-2"
                >
                  <div className="my-auto space-y-3 text-center">
                    <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">
                        Password Reset Successful
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your password has been securely updated. You can now log in using your new credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('email')}
                      className="w-full h-10 flex items-center justify-center font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-[0.99]"
                    >
                      <LogIn className="h-4 w-4 mr-1.5" />
                      <span>Proceed to Sign In</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 text-center mt-4">
          © 2026 Plexivia. All rights reserved.
        </p>
      </motion.div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-6 z-[999] flex items-center justify-center pointer-events-auto">
        <a
          href="https://plexivia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 shadow-2xl backdrop-blur-md transition-all group"
          title="Developed by Plexivia"
        >
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 group-hover:text-zinc-200 whitespace-nowrap">
            Powered by
          </span>
          <img
            src={plexiviaLogo}
            alt="Plexivia"
            className="h-5 sm:h-6 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
export { LoginPage as SharedLoginPage };
