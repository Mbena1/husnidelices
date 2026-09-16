import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

export function Logo({ className = '' }: { className?: string }) {
  const { settings } = useSettings();
  const name = settings?.bakery_name || 'Délices Dorés';

  if (settings?.logo_url) {
    return (
      <img
        src={settings.logo_url}
        alt={name}
        className={`h-10 w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src="/favicon.png"
        alt={name}
        className="w-10 h-10 object-contain"
      />

      <span className="font-display text-xl font-bold text-primary-800 tracking-tight">
        {name}
      </span>
    </Link>
  );
}