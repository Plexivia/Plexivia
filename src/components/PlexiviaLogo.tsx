interface PlexiviaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function PlexiviaLogo({
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
}: PlexiviaLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[6px]',
    md: 'text-[7.5px]',
    lg: 'text-[9.5px]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Brand Icon Badge */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(88,193,195,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="plexiviaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#97CC6F" />
              <stop offset="100%" stopColor="#58C1C3" />
            </linearGradient>
          </defs>
          {/* Outer Rounded Container */}
          <rect width="100" height="100" rx="22" fill="url(#plexiviaGrad)" />

          {/* Stylized P Monogram matching official brandmark */}
          {/* Vertical left leg with space */}
          <rect x="24" y="47" width="13" height="28" rx="2" fill="#0C1618" />
          {/* Main P upper arch and horizontal flow */}
          <path
            d="M24 25H59C71.7026 25 81 33.9543 81 45.5C81 57.0457 71.7026 66 59 66H37V48.5H57C62.5228 48.5 66.5 45.0228 66.5 40.5C66.5 35.9772 62.5228 32.5 57 32.5H24V25Z"
            fill="#0C1618"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-black tracking-[0.14em] uppercase text-[#58C1C3] leading-none ${titleSizes[size]}`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          PLEXIVIA
        </span>
        {showTagline && (
          <span
            className={`font-medium uppercase tracking-[0.28em] text-[#F5F7F7]/80 mt-1 whitespace-nowrap leading-none ${taglineSizes[size]}`}
          >
            CRAFTING DIGITAL DREAMS
          </span>
        )}
      </div>
    </div>
  );
}
