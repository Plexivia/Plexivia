interface PlexiviaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  variant?: 'dark' | 'light' | 'white' | 'icon';
  onClick?: () => void;
}

export default function PlexiviaLogo({
  size = 'md',
  showTagline = true,
  className = '',
  variant = 'dark',
  onClick,
}: PlexiviaLogoProps) {
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
  };

  const getLogoSrc = () => {
    if (variant === 'icon') {
      return '/icon.png';
    }
    if (variant === 'light') {
      return showTagline ? '/brand-light.png' : '/brand-minimal-light.png';
    }
    if (variant === 'white') {
      return showTagline ? '/brand-white.png' : '/brand-minimal-white.png';
    }
    // Default: dark logo text for light backgrounds
    return showTagline ? '/brand-dark.png' : '/brand-minimal-dark.png';
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <img
        src={getLogoSrc()}
        alt="Plexivia - Crafting Digital Dreams"
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
