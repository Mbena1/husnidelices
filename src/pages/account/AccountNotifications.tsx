import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, LoadingSpinner } from '@/components/States';
import { formatDateTime } from '@/lib/utils';
import type { Notification } from '@/lib/types';

function AccountNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data as Notification[] || []);
    setLoading(false);
  }

  useEffect(() => { loadNotifications(); }, [profile]);

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    loadNotifications();
  }

  async function markAllRead() {
    if (!profile) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    loadNotifications();
  }

  async function remove(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    loadNotifications();
  }

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-primary-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-700" />
          Notifications
          {unreadCount > 0 && <span className="badge bg-accent-400 text-primary-900">{unreadCount}</span>}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm">
            <CheckCheck className="w-4 h-4" />
            Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Aucune notification" message="Vous n'avez pas encore de notification" />
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${
                notif.is_read ? 'border-cream-200' : 'border-accent-300 bg-accent-50/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notif.is_read ? 'bg-cream-100 text-primary-400' : 'bg-accent-100 text-accent-600'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary-900 text-sm">{notif.title}</p>
                <p className="text-sm text-primary-500">{notif.message}</p>
                <p className="text-xs text-primary-400 mt-1">{formatDateTime(notif.created_at)}</p>
              </div>
              <div className="flex gap-1">
                {!notif.is_read && (
                  <button onClick={() => markAsRead(notif.id)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => remove(notif.id)} className="p-1.5 rounded-lg text-error-500 hover:bg-error-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountNotifications;
