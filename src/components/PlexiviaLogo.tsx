import { useTheme } from '../context/ThemeContext';

interface PlexiviaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  variant?: 'auto' | 'dark' | 'light' | 'white' | 'icon';
  onClick?: () => void;
}

export default function PlexiviaLogo({
  size = 'md',
  showTagline = true,
  className = '',
  variant = 'auto',
  onClick,
}: PlexiviaLogoProps) {
  let theme: 'light' | 'dark' = 'dark';
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch {
    // Fallback if rendered outside ThemeProvider
    theme = 'dark';
  }

  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
  };

  const getLogoSrc = () => {
    if (variant === 'icon') {
      return '/icon.png';
    }
    if (variant === 'white') {
      return showTagline ? '/brand-white.png' : '/brand-minimal-white.png';
    }
    if (variant === 'light') {
      return showTagline ? '/brand-light.png' : '/brand-minimal-light.png';
    }
    if (variant === 'dark') {
      return showTagline ? '/brand-dark.png' : '/brand-minimal-dark.png';
    }

    // Auto theme-aware:
    // In dark mode (dark background) -> use brand-light.png
    // In light mode (light background) -> use brand-dark.png
    if (theme === 'dark') {
      return showTagline ? '/brand-light.png' : '/brand-minimal-light.png';
    }
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
