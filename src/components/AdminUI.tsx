import type { ReactNode } from 'react';

export function AdminPageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <h1 className="font-display text-2xl font-bold text-primary-900">{title}</h1>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, icon: Icon, color = 'bg-primary-50 text-primary-700',
}: {
  label: string; value: string | number; icon: any; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-cream-200">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-display font-bold text-primary-900">{value}</p>
      <p className="text-xs text-primary-500 mt-1">{label}</p>
    </div>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
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
  const labels: Record<string, string> = {
    pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
    ready: 'Prête', delivered: 'Livrée', cancelled: 'Annulée', refused: 'Refusée',
    reviewing: 'En examen', quoted: 'Devis envoyé', accepted: 'Acceptée', declined: 'Refusée',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
}
