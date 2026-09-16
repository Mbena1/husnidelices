import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AccountLayout } from '@/layouts/AccountLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingSpinner } from '@/components/States';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const PromotionsPage = lazy(() => import('@/pages/PromotionsPage'));
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const CustomRequestPage = lazy(() => import('@/pages/CustomRequestPage'));

const AccountDashboard = lazy(() => import('@/pages/account/AccountDashboard'));
const AccountOrders = lazy(() => import('@/pages/account/AccountOrders'));
const AccountRequests = lazy(() => import('@/pages/account/AccountRequests'));
const AccountFavorites = lazy(() => import('@/pages/account/AccountFavorites'));
const AccountProfile = lazy(() => import('@/pages/account/AccountProfile'));
const AccountSecurity = lazy(() => import('@/pages/account/AccountSecurity'));
const AccountSettings = lazy(() => import('@/pages/account/AccountSettings'));
const AccountNotifications = lazy(() => import('@/pages/account/AccountNotifications'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminRequests = lazy(() => import('@/pages/admin/AdminRequests'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'));
const AdminPromotions = lazy(() => import('@/pages/admin/AdminPromotions'));
const AdminCollections = lazy(() => import('@/pages/admin/AdminCollections'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminThemes = lazy(() => import('@/pages/admin/AdminThemes'));
const AdminClients = lazy(() => import('@/pages/admin/AdminClients'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!session) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/boutique" element={<ShopPage />} />
          <Route path="/produit/:slug" element={<ProductDetailPage />} />
          <Route path="/galerie" element={<GalleryPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionsPage />} />
          <Route path="/commande-personnalisee" element={<CustomRequestPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/commande-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        </Route>

        {/* Auth */}
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<SignupPage />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Customer account */}
        <Route path="/compte" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<AccountDashboard />} />
          <Route path="profil" element={<AccountProfile />} />
          <Route path="commandes" element={<AccountOrders />} />
          <Route path="demandes" element={<AccountRequests />} />
          <Route path="favoris" element={<AccountFavorites />} />
          <Route path="notifications" element={<AccountNotifications />} />
          <Route path="securite" element={<AccountSecurity />} />
          <Route path="parametres" element={<AccountSettings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="commandes" element={<AdminOrders />} />
          <Route path="demandes" element={<AdminRequests />} />
          <Route path="produits" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="galerie" element={<AdminGallery />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="evenements" element={<AdminEvents />} />
          <Route path="themes" element={<AdminThemes />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="parametres" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
