import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Edit3,
  Camera,
  Bell,
  ChevronRight,
  Shield,
  CreditCard,
  TrendingUp,
  Crown,
  Code,
  Tag,
  Sparkles,
  Gift,
  Percent,
  ShoppingBag,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { userService, orderService, productService } from '@/lib/services';
import type { Order, Address, TeamMember, Product } from '@/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button, IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function AccountPage() {
  const { user, profile, signOut, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoBanner, setPromoBanner] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setIsLoading(true);
    try {
      await fetchProfile();
      const [ordersData, profileData, productsData, couponsData] = await Promise.all([
        orderService.getByUser(user.id).catch(() => []),
        userService.getProfile(user.id).catch(() => null),
        productService.getFeatured().catch(() => []),
        Promise.resolve({ data: { coupons: [] } }).catch(() => ({ data: { coupons: [] } }))
      ]);
      setOrders(ordersData.slice(0, 3));
      if (profileData) {
        setAddresses(profileData.addresses || []);
        setTeamMember(profileData.team_member || null);
      }
      setFeaturedProducts(productsData.slice(0, 4));
      setActiveCoupons(couponsData.data?.coupons?.slice(0, 3) || []);

      // Promotional banner simulation
      const today = new Date();
      const hour = today.getHours();
      let promo = null;
      if (hour >= 6 && hour < 12) {
        promo = {
          type: 'morning',
          title: 'Buenos Días!',
          subtitle: '20% OFF en toda la colección urbana',
          code: 'MANANA20',
          color: 'from-amber-500 to-orange-500'
        };
      } else if (hour >= 12 && hour < 18) {
        promo = {
          type: 'afternoon',
          title: 'Tarde de Estilo',
          subtitle: 'Envío gratis en pedidos +$100.000',
          code: 'TARDEGRATIS',
          color: 'from-blue-500 to-indigo-500'
        };
      } else {
        promo = {
          type: 'night',
          title: 'Oferta Nocturna',
          subtitle: '3x2 en selected items',
          code: 'NOCHE3X2',
          color: 'from-purple-500 to-pink-500'
        };
      }
      setPromoBanner(promo);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const isOwner = profile?.role === 'super_admin';
  const isDeveloper = profile?.role === 'developer' || teamMember?.position === 'developer';
  const isAdmin = profile?.role === 'admin' || isOwner;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Promo Banner */}
        <AnimatePresence>
          {promoBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'mb-6 rounded-2xl p-6 bg-gradient-to-r text-white overflow-hidden relative',
                promoBanner.color
              )}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">Oferta Especial</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{promoBanner.title}</h2>
                  <p className="opacity-90">{promoBanner.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 font-mono">
                    <span className="text-sm opacity-75">Código:</span>
                    <span className="font-bold ml-2">{promoBanner.code}</span>
                  </div>
                  <Link
                    to="/shop"
                    className="bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    Ver Oferta <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header con avatar y info básica */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-zinc-700 overflow-hidden ring-4 ring-white/20">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-400">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <Link
                to="/account/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                {isOwner && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Propietario
                  </span>
                )}
                {isDeveloper && !isOwner && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                    <Code className="w-3 h-3" /> Developer
                  </span>
                )}
                {isAdmin && !isOwner && !isDeveloper && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-zinc-400 mb-2">{profile?.email}</p>
              {profile?.bio && (
                <p className="text-zinc-500 text-sm max-w-md">{profile.bio}</p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-zinc-500">
                <span>Miembro desde {new Date(profile?.created_at || '').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</span>
                {profile?.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300"
                  >
                    @{profile.instagram_handle}
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to="/account/edit"
                className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Editar Perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Cupones Activos del Cliente */}
        {activeCoupons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-5 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-400">Tus Cupones Disponibles</h3>
                </div>
                <Link to="/shop" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-black/30 rounded-xl p-4 border border-emerald-500/20 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white font-mono">{coupon.code}</p>
                      <p className="text-xs text-emerald-400">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}% OFF`
                          : formatCurrency(coupon.discount_value) + ' OFF'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(coupon.code)}
                      className="p-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      <Tag className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-zinc-500 text-sm">Pedidos</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{addresses.length}</p>
            <p className="text-zinc-500 text-sm">Direcciones</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{profile?.preferred_size || '-'}</p>
            <p className="text-zinc-500 text-sm">Talla</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{profile?.preferred_shoe_size || '-'}</p>
            <p className="text-zinc-500 text-sm">Calzado</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Menu principal */}
          <div className="md:col-span-2 space-y-4">
            {/* Productos Destacados */}
            {featuredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" /> Productos Destacados
                  </h2>
                  <Link to="/shop" className="text-sm text-white hover:text-zinc-300 flex items-center gap-1">
                    Ver tienda <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="group block"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-zinc-800 mb-2">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/300x400'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.compare_at_price && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            -{calculateDiscount(product.compare_at_price, product.price)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-zinc-400">{formatCurrency(product.price)}</p>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Promociones Activas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl overflow-hidden border border-purple-500/30"
            >
              <div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2 text-purple-300">
                  <Percent className="w-5 h-5" /> Promociones Vigentes
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Compra 1 y Lleva 2</p>
                      <p className="text-xs text-purple-300">En selected items de la temporada</p>
                    </div>
                  </div>
                  <Link to="/shop?promo=3x2" className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors">
                    Ver
                  </Link>
                </div>
                <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Gift className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium">Envío Gratis</p>
                      <p className="text-xs text-purple-300">En pedidos mayores a $100.000</p>
                    </div>
                  </div>
                  <Link to="/shop" className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors">
                    Ver
                  </Link>
                </div>
                <div className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium">Flash Sale - 24h</p>
                      <p className="text-xs text-purple-300">Hasta 50% OFF en categorías seleccionadas</p>
                    </div>
                  </div>
                  <Link to="/shop?promo=flash" className="px-3 py-1 bg-amber-500 text-black text-sm rounded-lg hover:bg-amber-600 transition-colors">
                    Ver
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Últimos pedidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-zinc-400" /> Mis Pedidos
                </h2>
                <Link to="/account/orders" className="text-sm text-white hover:text-zinc-300">
                  Ver todos
                </Link>
              </div>
              {orders.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/account/orders/${order.id}`}
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">#{order.order_number}</p>
                        <p className="text-sm text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status === 'delivered' ? 'Entregado' :
                           order.status === 'shipped' ? 'Enviado' :
                           order.status === 'processing' ? 'Procesando' :
                           order.status === 'cancelled' ? 'Cancelado' :
                           'Pendiente'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes pedidos aún</p>
                  <Link to="/shop" className="text-white hover:underline text-sm mt-2 inline-block">
                    Explorar tienda
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Direcciones guardadas */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-zinc-400" /> Direcciones
                </h2>
                <Link to="/account/addresses" className="text-sm text-white hover:text-zinc-300">
                  Gestionar
                </Link>
              </div>
              {addresses.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {addresses.slice(0, 2).map((address) => (
                    <div key={address.id} className="p-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        address.is_default ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{address.label}</p>
                          {address.is_default && (
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">Principal</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500">
                          {address.street}, {address.city}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay direcciones guardadas</p>
                  <Link to="/account/addresses" className="text-white hover:underline text-sm mt-2 inline-block">
                    Agregar dirección
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Menú rápido */}
          <div className="space-y-4">
            {/* Accesos rápidos */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <nav className="divide-y divide-zinc-800">
                <Link
                  to="/account/edit"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-zinc-400" />
                    <span>Editar Perfil</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-zinc-400" />
                    <span>Mis Pedidos</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
                <Link
                  to="/account/addresses"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-zinc-400" />
                    <span>Direcciones</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-zinc-400" />
                    <span>Lista de Deseos</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
                <Link
                  to="/account/notifications"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-zinc-400" />
                    <span>Notificaciones</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
                <Link
                  to="/account/settings"
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-zinc-400" />
                    <span>Configuración</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </Link>
              </nav>
            </div>

            {/* Panel especial para Team Members y Admins */}
            {(isOwner || isDeveloper || isAdmin || teamMember) && (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                <div className="p-4 border-b border-zinc-700">
                  <h3 className="font-semibold flex items-center gap-2">
                    {isOwner ? (
                      <><Crown className="w-5 h-5 text-yellow-400" /> Panel Propietario</>
                    ) : isAdmin && !isOwner ? (
                      <><Shield className="w-5 h-5 text-purple-400" /> Panel Admin</>
                    ) : isDeveloper ? (
                      <><Code className="w-5 h-5 text-blue-400" /> Panel Developer</>
                    ) : (
                      <><TrendingUp className="w-5 h-5 text-green-400" /> Panel Equipo</>
                    )}
                  </h3>
                </div>
                <nav className="divide-y divide-zinc-700">
                  {(isOwner || isAdmin) && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <span>Panel Admin</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </Link>
                  )}

                  {isOwner && (
                    <>
                      <Link
                        to="/account/owner-dashboard"
                        className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span>Dashboard Ingresos</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </Link>
                      <Link
                        to="/account/team"
                        className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-400" />
                          <span>Gestionar Equipo</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </Link>
                      <Link
                        to="/account/commissions"
                        className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-yellow-400" />
                          <span>Pagar Comisiones</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </Link>
                    </>
                  )}
                  {isDeveloper && (
                    <Link
                      to="/account/my-commissions"
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span>Mis Comisiones (12%)</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </Link>
                  )}
                  {teamMember && teamMember.commission_percentage > 0 && !isDeveloper && (
                    <Link
                      to="/account/my-commissions"
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span>Mis Comisiones ({teamMember.commission_percentage}%)</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </Link>
                  )}
                  {(isOwner || isAdmin || (teamMember?.can_view_analytics)) && (
                    <Link
                      to="/admin/analytics"
                      className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-zinc-400" />
                        <span>Analytics</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </Link>
                  )}
                </nav>
              </div>
            )}

            {/* Cerrar sesión */}
            <button
              onClick={handleSignOut}
              className="w-full bg-zinc-900 rounded-xl p-4 flex items-center gap-3 text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
