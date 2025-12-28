import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronRight,
  LogOut,
  Shield,
  Store,
  Truck,
  CreditCard,
  Bell,
  MessageSquare,
  Tag,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  productService,
  orderService,
  userService,
  analyticsService,
} from '@/lib/services';
import { formatCurrency } from '@/lib/utils';
import type { Product, Order } from '@/types';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export function AdminDashboardPage() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load analytics data
      const analyticsData = await analyticsService.getDashboardMetrics();

      // Load recent orders
      const ordersData = await orderService.getAll({ limit: 5 });
      setRecentOrders(ordersData.data);

      // Load recent products
      const productsData = await productService.getAllAdmin({ limit: 5 });
      setRecentProducts(productsData);

      // Calculate stats from analytics data
      const totalRevenue = analyticsData.today_revenue || 0;
      const totalOrders = analyticsData.today_orders || 0;
      const totalProducts = productsData.length || 0;
      const totalCustomers = analyticsData.new_customers_today || 0;

      // Count pending orders
      const pendingOrders = ordersData.data.filter(
        (order: Order) => order.status === 'pending'
      ).length;

      // Count low stock products (this would need to be calculated from products)
      const lowStockProducts = productsData.filter(
        (product: Product) => product.quantity > 0 && product.quantity <= 10
      ).length;

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Agregar Producto',
      description: 'Crear nuevo producto en la tienda',
      icon: Plus,
      href: '/admin/products',
      color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
    },
    {
      title: 'Ver Pedidos',
      description: 'Gestionar pedidos pendientes',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : null,
    },
    {
      title: 'Ver Analytics',
      description: 'Estadísticas de ventas y rendimiento',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
    },
    {
      title: 'Gestionar Clientes',
      description: 'Ver y administrar usuarios',
      icon: Users,
      href: '/admin/customers',
      color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                <p className="text-gray-400">Bienvenido, {profile?.full_name}</p>
                {/* Debug Info */}
                <div className="text-xs text-yellow-400 mt-1">
                  Rol: {profile?.role} | Email: {profile?.email}
                  {profile?.role !== 'admin' && profile?.role !== 'super_admin' && (
                    <span className="text-red-400 ml-2">⚠️ Este usuario NO tiene permisos de admin</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Ingresos Totales</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              {stats.pendingOrders > 0 && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  {stats.pendingOrders} pendientes
                </span>
              )}
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Pedidos</h3>
            <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              {stats.lowStockProducts > 0 && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {stats.lowStockProducts} bajo stock
                </span>
              )}
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Productos</h3>
            <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Clientes</h3>
            <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className={`${action.color} border border-current/20 rounded-xl p-6 hover:scale-105 transition-all duration-200 block group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <action.icon className="w-8 h-8" />
                  {action.badge && (
                    <span className="px-2 py-1 bg-current/30 text-current text-xs rounded-full">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-current/70 text-sm">{action.description}</p>
                <ChevronRight className="w-4 h-4 text-current/50 group-hover:text-current mt-2" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Pedidos Recientes
              </h3>
              <Link
                to="/admin/orders"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-800">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">#{order.order_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status === 'delivered' ? 'Entregado' :
                         order.status === 'shipped' ? 'Enviado' :
                         order.status === 'processing' ? 'Procesando' :
                         order.status === 'pending' ? 'Pendiente' :
                         order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </span>
                      <span className="text-white font-medium">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay pedidos recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                Productos Recientes
              </h3>
              <Link
                to="/admin/products"
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-800">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{product.name}</h4>
                        <p className="text-gray-400 text-sm">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{formatCurrency(product.price)}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.quantity > 10 ? 'bg-green-500/20 text-green-400' :
                          product.quantity > 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          Stock: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay productos recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Navegación Rápida</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              to="/admin/products"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <Package className="w-8 h-8 text-blue-400 group-hover:text-blue-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Productos</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-8 h-8 text-orange-400 group-hover:text-orange-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Pedidos</span>
            </Link>
            <Link
              to="/admin/customers"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <Users className="w-8 h-8 text-green-400 group-hover:text-green-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Clientes</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <BarChart3 className="w-8 h-8 text-purple-400 group-hover:text-purple-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Analytics</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <Settings className="w-8 h-8 text-gray-400 group-hover:text-gray-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Ajustes</span>
            </Link>
            <Link
              to="/shop"
              className="flex flex-col items-center p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <Store className="w-8 h-8 text-pink-400 group-hover:text-pink-300 mb-2" />
              <span className="text-gray-300 group-hover:text-white text-sm font-medium">Tienda</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}