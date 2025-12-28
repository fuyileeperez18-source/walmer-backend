import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import { Layout, SimpleLayout } from '@/components/layout/Layout';

// Components
import { AccountRouter } from '@/components/AccountRouter';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCustomers } from '@/pages/admin/AdminCustomers';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { DebugPage } from '@/pages/DebugPage';

// Account Pages
import {
  AccountPage,
  AdminDashboardPage,
  EditProfilePage,
  MyOrdersPage,
  MyCommissionsPage,
  OwnerDashboardPage,
  TeamManagementPage,
  CommissionsManagementPage
} from '@/pages/account';

// Stores
import { useAuthStore } from '@/stores/authStore';

// Styles
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({
  children,
  adminOnly = false,
  ownerOnly = false,
  teamOnly = false
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  ownerOnly?: boolean;
  teamOnly?: boolean;
}) {
  const { isAuthenticated, profile, isLoading } = useAuthStore();

  console.log('🔐 [ProtectedRoute] Check - isAuthenticated:', isAuthenticated);
  console.log('🔐 [ProtectedRoute] Profile:', profile);
  console.log('🔐 [ProtectedRoute] Profile role:', profile?.role);
  console.log('🔐 [ProtectedRoute] Flags - adminOnly:', adminOnly, 'ownerOnly:', ownerOnly, 'teamOnly:', teamOnly);

  if (isLoading) {
    console.log('⏳ [ProtectedRoute] Loading...');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ [ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Solo propietario (super_admin)
  if (ownerOnly && profile?.role !== 'super_admin') {
    console.log('❌ [ProtectedRoute] Owner only - redirecting to account');
    return <Navigate to="/account" replace />;
  }

  // Admin o superior
  if (adminOnly && profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    console.log('❌ [ProtectedRoute] Admin only - Role is:', profile?.role, '- redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Miembro del equipo (developer, admin, super_admin)
  if (teamOnly && profile?.role === 'customer') {
    console.log('❌ [ProtectedRoute] Team only - redirecting to account');
    return <Navigate to="/account" replace />;
  }

  console.log('✅ [ProtectedRoute] Access granted');
  return <>{children}</>;
}

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from stored token
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/collections/:slug" element={<ShopPage />} />
            <Route path="/about" element={<div className="min-h-screen bg-black py-20 text-center text-white">About Page</div>} />
            <Route path="/contact" element={<div className="min-h-screen bg-black py-20 text-center text-white">Contact Page</div>} />
          </Route>

          {/* Auth routes */}
          <Route element={<SimpleLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<div className="min-h-screen bg-black py-20 text-center text-white">Forgot Password</div>} />
          </Route>

          {/* Checkout (separate layout) */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="messages" element={<div className="text-white">Messages</div>} />
            <Route path="coupons" element={<div className="text-white">Coupons</div>} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Account routes */}
          <Route element={<Layout />}>
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/orders/:id"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-black py-20 text-center text-white">Order Details</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/addresses"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-black py-20 text-center text-white">Mis Direcciones</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/notifications"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-black py-20 text-center text-white">Notificaciones</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/settings"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-black py-20 text-center text-white">Configuración</div>
                </ProtectedRoute>
              }
            />
            {/* Developer/Team member routes */}
            <Route
              path="/account/my-commissions"
              element={
                <ProtectedRoute teamOnly>
                  <MyCommissionsPage />
                </ProtectedRoute>
              }
            />
            {/* Owner only routes */}
            <Route
              path="/account/owner-dashboard"
              element={
                <ProtectedRoute ownerOnly>
                  <OwnerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/team"
              element={
                <ProtectedRoute ownerOnly>
                  <TeamManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/commissions"
              element={
                <ProtectedRoute ownerOnly>
                  <CommissionsManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debug"
              element={
                <ProtectedRoute>
                  <DebugPage />
                </ProtectedRoute>
              }
            />
            <Route path="/wishlist" element={<div className="min-h-screen bg-black py-20 text-center text-white">Wishlist</div>} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                  <h1 className="text-6xl font-bold mb-4">404</h1>
                  <p className="text-gray-400 mb-8">Page not found</p>
                  <a href="/" className="px-6 py-3 bg-white text-black rounded-full font-medium">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;