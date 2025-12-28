import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Tag,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useAuthStore } from '@/stores/authStore';
import { cn, formatCurrency } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';

// Sidebar navigation
const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, badge: 5 },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, badge: 3 },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Mock data
const revenueData = [
  { name: 'Jan', revenue: 4000, orders: 24 },
  { name: 'Feb', revenue: 3000, orders: 18 },
  { name: 'Mar', revenue: 5000, orders: 32 },
  { name: 'Apr', revenue: 4500, orders: 28 },
  { name: 'May', revenue: 6000, orders: 38 },
  { name: 'Jun', revenue: 5500, orders: 35 },
  { name: 'Jul', revenue: 7000, orders: 45 },
];

const orderStatusData = [
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Processing', value: 25, color: '#3b82f6' },
  { name: 'Shipped', value: 40, color: '#8b5cf6' },
  { name: 'Delivered', value: 80, color: '#10b981' },
  { name: 'Cancelled', value: 5, color: '#ef4444' },
];

const recentOrders = [
  { id: 'WLM-001', customer: 'John Doe', total: 189.00, status: 'processing', date: '2 min ago' },
  { id: 'WLM-002', customer: 'Sarah Smith', total: 249.00, status: 'pending', date: '15 min ago' },
  { id: 'WLM-003', customer: 'Mike Johnson', total: 89.00, status: 'shipped', date: '1 hour ago' },
  { id: 'WLM-004', customer: 'Emily Brown', total: 329.00, status: 'delivered', date: '2 hours ago' },
  { id: 'WLM-005', customer: 'David Wilson', total: 159.00, status: 'processing', date: '3 hours ago' },
];

const topProducts = [
  { name: 'Essential Cotton Tee', sales: 245, revenue: 12005, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' },
  { name: 'Urban Denim Jacket', sales: 189, revenue: 35721, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100' },
  { name: 'Slim Fit Chinos', sales: 156, revenue: 13884, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100' },
  { name: 'Premium Leather Belt', sales: 134, revenue: 7906, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100' },
];

const lowStockProducts = [
  { name: 'Wool Overcoat - Size M', stock: 3, sku: 'WO-001-M' },
  { name: 'Minimalist Watch - Black', stock: 5, sku: 'MW-001-B' },
  { name: 'Canvas Sneakers - Size 10', stock: 2, sku: 'CS-001-10' },
];

// Sidebar component
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-primary-950 border-r border-primary-800 flex flex-col',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ duration: 0.2 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-primary-800">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">MELO SPORTT</span>
            <span className="text-xs text-gray-500 bg-primary-800 px-2 py-0.5 rounded">Admin</span>
          </Link>
          <IconButton className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-primary-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    isActive ? 'bg-black text-white' : 'bg-red-500 text-white'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-primary-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-primary-900 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-900 rounded-xl p-6 border border-primary-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          changeType === 'increase' ? 'text-green-400' : 'text-red-400'
        )}>
          {changeType === 'increase' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

// Order status badge
function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', styles[status])}>
      {status}
    </span>
  );
}

// Main Dashboard component
export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Check if we're on the main dashboard or a sub-page
  const isMainDashboard = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="h-16 bg-primary-950 border-b border-primary-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <IconButton className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </IconButton>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 h-10 pl-10 pr-4 bg-primary-900 border border-primary-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <IconButton className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </IconButton>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-medium">
                A
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        {isMainDashboard ? (
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Page title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(35000)}
                change="+12.5%"
                changeType="increase"
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatsCard
                title="Total Orders"
                value="165"
                change="+8.2%"
                changeType="increase"
                icon={ShoppingCart}
                color="bg-blue-500"
              />
              <StatsCard
                title="Total Customers"
                value="1,234"
                change="+5.7%"
                changeType="increase"
                icon={Users}
                color="bg-purple-500"
              />
              <StatsCard
                title="Avg. Order Value"
                value={formatCurrency(212)}
                change="-2.3%"
                changeType="decrease"
                icon={TrendingUp}
                color="bg-orange-500"
              />
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-primary-900 rounded-xl p-6 border border-primary-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
                  <select className="bg-primary-800 border border-primary-700 rounded-lg px-3 py-1 text-sm text-white">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ffffff"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Order status chart */}
              <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
                <h2 className="text-lg font-semibold text-white mb-6">Order Status</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-400 text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tables row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Recent orders */}
              <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
                  <Link
                    to="/admin/orders"
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    View all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white font-medium">
                          {order.customer[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.customer}</p>
                          <p className="text-gray-500 text-sm">{order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(order.total)}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Top Products</h2>
                  <Link
                    to="/admin/products"
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    View all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-4">
                      <span className="text-gray-500 font-medium w-6">{index + 1}</span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{product.name}</p>
                        <p className="text-gray-500 text-sm">{product.sales} sales</p>
                      </div>
                      <p className="text-white font-medium">{formatCurrency(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.sku}
                    className="flex items-center justify-between p-4 bg-primary-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
