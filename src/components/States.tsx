import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} text-accent-400 animate-spin`} />
    </div>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  actionLink,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
        <span className="text-2xl">!</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">{title}</h3>
      <p className="text-primary-500 text-sm max-w-md mb-6">{message}</p>
      {actionLabel && actionLink && (
        <a href={actionLink} className="btn-primary">
          {actionLabel}
        </a>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-error-500/10 flex items-center justify-center mb-4">
        <span className="text-error-500 text-2xl">!</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-primary-900 mb-2">Une erreur est survenue</h3>
      <p className="text-primary-500 text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Réessayer
        </button>
      )}
    </div>
  );
}
