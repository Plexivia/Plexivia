import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = '',
  theme = 'auto',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return (
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark')
      );
    }
    return true;
  });

  // Track system or class-based dark mode
  useEffect(() => {
    const checkDark = () => {
      if (typeof document !== 'undefined') {
        setIsDark(
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')
        );
      }
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    return () => observer.disconnect();
  }, []);

  // Compute effective theme: if explicitly set to 'light'/'dark', use it, else derive from isDark
  const effectiveTheme: 'light' | 'dark' =
    theme === 'light'
      ? 'light'
      : theme === 'dark'
      ? 'dark'
      : isDark
      ? 'dark'
      : 'light';

  // Cloudflare Turnstile site key for plexivia.online
  const siteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAEtanHA0PXZ5C5rM';

  useEffect(() => {
    // Check if script is already present
    const existingScript = document.getElementById('cf-turnstile-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        setIsScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      }
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.turnstile) return;

    // Clean up previous widget if exists
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        'error-callback': (code: string) => {
          if (onError) onError(code);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        theme: effectiveTheme,
        size: 'flexible',
      });
      widgetIdRef.current = id;
    } catch (err) {
      console.error('Turnstile render error:', err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [isScriptLoaded, siteKey, effectiveTheme]);

  return (
    <div className={`turnstile-wrapper my-2 ${className}`}>
      <div ref={containerRef} className="cf-turnstile flex justify-center sm:justify-start" />
    </div>
  );
}
