import { useSettings } from '@/contexts/SettingsContext';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
}

export function WhatsAppButton({ message, className = '' }: WhatsAppButtonProps) {
  const { settings } = useSettings();
  const number = settings?.whatsapp_number || '22901000000';
  const defaultMessage = settings?.whatsapp_message || 'Bonjour, je souhaite passer une commande.';
  const text = encodeURIComponent(message || defaultMessage);
  const href = `https://wa.me/${number}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium rounded-lg transition-all duration-300 hover:bg-[#1DA851] hover:shadow-lg hover:shadow-[#25D366]/30 active:scale-95 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      WhatsApp
    </a>
  );
}

export function FloatingWhatsApp() {
  const { settings } = useSettings();
  const number = settings?.whatsapp_number || '22901000000';
  const defaultMessage = settings?.whatsapp_message || 'Bonjour, je souhaite passer une commande.';
  const text = encodeURIComponent(defaultMessage);
  const href = `https://wa.me/${number}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-110 transition-transform duration-300 animate-bounce-subtle"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  );
}
