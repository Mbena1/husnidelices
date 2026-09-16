export function formatPrice(amount: number, currency: string = 'FCFA'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DD-${year}${month}${day}-${random}`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refused: 'Refusée',
    reviewing: 'En cours d\'examen',
    quoted: 'Devis envoyé',
    accepted: 'Acceptée',
    declined: 'Refusée',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    refused: 'bg-red-100 text-red-700',
    reviewing: 'bg-blue-100 text-blue-700',
    quoted: 'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    declined: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export const ORDER_STATUSES: string[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
  'refused',
];

export const ORDER_STATUS_FLOW: string[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
];

export const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'mariage', label: 'Mariage' },
  { value: 'bapteme', label: 'Baptême' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'fete', label: 'Fête' },
  { value: 'professionnel', label: 'Événement professionnel' },
  { value: 'autre', label: 'Autre' },
];

export const GALLERY_CATEGORIES: { value: string; label: string }[] = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'bapteme', label: 'Baptême' },
  { value: 'evenement', label: 'Événement' },
  { value: 'personnalise', label: 'Personnalisé' },
  { value: 'autre', label: 'Autre' },
];
