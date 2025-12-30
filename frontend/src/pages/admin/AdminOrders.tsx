import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MessageSquare,
  Mail,
} from 'lucide-react';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { orderService } from '@/lib/services';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const paymentConfig = {
  pending: { label: 'Pendiente', color: 'text-yellow-600' },
  paid: { label: 'Pagado', color: 'text-green-600' },
  failed: { label: 'Fallido', color: 'text-red-600' },
  refunded: { label: 'Reembolsado', color: 'text-gray-600' },
};

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getAll({ limit: 100 });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleContactCustomer = () => {
    setIsContactModalOpen(true);
  };

  const sendContactMessage = () => {
    // Aquí implementarías el envío del mensaje
    toast.success('Mensaje enviado al cliente');
    setContactMessage('');
    setIsContactModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Pedidos</h1>
          <p className="text-gray-600">Gestiona y rastrea los pedidos de los clientes</p>
        </div>
        <Button leftIcon={<Download className="h-4 w-4" />} variant="outline">
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter === status
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-black'
              )}
            >
              {status === 'all' ? 'Todos' : statusConfig[status as keyof typeof statusConfig]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Pedido</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Cliente</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Total</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Estado</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Pago</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Fecha</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-black whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-black font-medium text-sm">#{order.order_number}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-black text-xs font-medium flex-shrink-0">
                            {order.user_id?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-black font-medium text-sm truncate">{order.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-black font-medium text-sm whitespace-nowrap">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={cn(
                          'text-xs font-medium',
                          paymentConfig[order.payment_status as keyof typeof paymentConfig]?.color || 'text-gray-600'
                        )}>
                          {paymentConfig[order.payment_status as keyof typeof paymentConfig]?.label || order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {formatDate(order.created_at, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton onClick={() => openOrderDetail(order)}>
                            <Eye className="h-4 w-4" />
                          </IconButton>
                          <IconButton>
                            <MoreVertical className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay pedidos disponibles</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-black font-semibold">#{order.order_number}</p>
                    <p className="text-gray-600 text-sm">{order.user_id}</p>
                  </div>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                    statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'
                  )}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-black font-semibold">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pago:</span>
                    <span className={cn(
                      'font-medium',
                      paymentConfig[order.payment_status as keyof typeof paymentConfig]?.color || 'text-gray-600'
                    )}>
                      {paymentConfig[order.payment_status as keyof typeof paymentConfig]?.label || order.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="text-gray-800">
                      {formatDate(order.created_at, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => openOrderDetail(order)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Ver Detalles
                </Button>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay pedidos disponibles</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Pedido #${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'
              )}>
                {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label || selectedOrder.status}
              </span>
              <span className="text-gray-600 text-sm">
                {formatDate(selectedOrder.created_at)}
              </span>
            </div>

            {/* Customer info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-black font-semibold mb-3">Cliente</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-black font-medium">
                  {selectedOrder.user_id?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-black font-medium">{selectedOrder.user_id}</p>
                  <p className="text-gray-600 text-sm">ID: {selectedOrder.user_id}</p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-black font-semibold mb-3">Resumen del Pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-black">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Descuento</span>
                    <span className="text-green-600">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-black">{formatCurrency(selectedOrder.shipping_cost)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Impuesto</span>
                    <span className="text-black">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-black font-semibold">Total</span>
                  <span className="text-black font-bold text-lg">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Contact Customer Button */}
            <Button
              onClick={handleContactCustomer}
              className="w-full"
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Contactar Cliente sobre este Pedido
            </Button>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              {selectedOrder.status === 'pending' && (
                <Button className="flex-1">Procesar Pedido</Button>
              )}
              {selectedOrder.status === 'processing' && (
                <Button className="flex-1" leftIcon={<Truck className="h-4 w-4" />}>
                  Marcar como Enviado
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button className="flex-1" leftIcon={<Package className="h-4 w-4" />}>
                  Marcar como Entregado
                </Button>
              )}
              <Button variant="outline" className="flex-1">
                Imprimir Factura
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Contactar Cliente"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Envía un mensaje al cliente sobre el pedido #{selectedOrder?.order_number}
          </p>
          <textarea
            className="w-full h-32 px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-black resize-none"
            placeholder="Escribe tu mensaje aquí..."
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsContactModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={sendContactMessage}
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={!contactMessage.trim()}
            >
              Enviar Mensaje
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
