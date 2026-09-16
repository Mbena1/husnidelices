import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { FloatingWhatsApp } from '@/components/WhatsAppButton';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </div>
  );
}
