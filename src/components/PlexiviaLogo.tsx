import logoImg from '@/assets/logo.png';
import favImg from '@/assets/fav.png';

interface PlexiviaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  iconOnly?: boolean;
}

export default function PlexiviaLogo({
  size = 'md',
  className = '',
  onClick,
  iconOnly = false,
}: PlexiviaLogoProps) {
  const heightClasses = {
    sm: 'h-8 sm:h-9.5',
    md: 'h-10 sm:h-11.5',
    lg: 'h-13 sm:h-15',
  };

  const iconClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {iconOnly ? (
        <img
          src={favImg}
          alt="Plexivia Icon"
          className={`${iconClasses[size]} object-contain rounded-xl drop-shadow-[0_0_12px_rgba(88,193,195,0.35)]`}
          loading="eager"
        />
      ) : (
        <img
          src={logoImg}
          alt="Plexivia - Crafting Digital Dreams"
          className={`${heightClasses[size]} w-auto object-contain drop-shadow-[0_0_15px_rgba(88,193,195,0.2)]`}
          loading="eager"
        />
      )}
    </div>
  );
}

