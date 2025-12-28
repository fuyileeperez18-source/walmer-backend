import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
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
} from 'lucide-react';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const orders = [
  {
    id: 'WLM-001',
    customer: { name: 'John Doe', email: 'john@example.com', avatar: 'J' },
    items: 3,
    total: 189.00,
    status: 'processing',
    payment: 'paid',
    date: '2025-01-25T10:30:00',
    shipping: { method: 'Express', tracking: null },
  },
  {
    id: 'WLM-002',
    customer: { name: 'Sarah Smith', email: 'sarah@example.com', avatar: 'S' },
    items: 2,
    total: 249.00,
    status: 'pending',
    payment: 'pending',
    date: '2025-01-25T09:15:00',
    shipping: { method: 'Standard', tracking: null },
  },
  {
    id: 'WLM-003',
    customer: { name: 'Mike Johnson', email: 'mike@example.com', avatar: 'M' },
    items: 1,
    total: 89.00,
    status: 'shipped',
    payment: 'paid',
    date: '2025-01-24T16:45:00',
    shipping: { method: 'Express', tracking: '1Z999AA10123456784' },
  },
  {
    id: 'WLM-004',
    customer: { name: 'Emily Brown', email: 'emily@example.com', avatar: 'E' },
    items: 4,
    total: 329.00,
    status: 'delivered',
    payment: 'paid',
    date: '2025-01-24T14:20:00',
    shipping: { method: 'Standard', tracking: '1Z999AA10123456785' },
  },
  {
    id: 'WLM-005',
    customer: { name: 'David Wilson', email: 'david@example.com', avatar: 'D' },
    items: 2,
    total: 159.00,
    status: 'cancelled',
    payment: 'refunded',
    date: '2025-01-24T11:00:00',
    shipping: { method: 'Standard', tracking: null },
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400', icon: RefreshCw },
  shipped: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-400', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

const paymentConfig = {
  pending: { label: 'Pending', color: 'text-yellow-400' },
  paid: { label: 'Paid', color: 'text-green-400' },
  failed: { label: 'Failed', color: 'text-red-400' },
  refunded: { label: 'Refunded', color: 'text-gray-400' },
};

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderDetail = (order: typeof orders[0]) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Manage and track customer orders</p>
        </div>
        <Button leftIcon={<Download className="h-4 w-4" />} variant="outline">
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-primary-900 border border-primary-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter === status
                  ? 'bg-white text-black'
                  : 'bg-primary-900 text-gray-400 hover:text-white'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-primary-900 rounded-xl border border-primary-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-800">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Order</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Items</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Total</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Payment</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Date</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-primary-800 last:border-0 hover:bg-primary-800/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {order.customer.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.customer.name}</p>
                          <p className="text-gray-500 text-sm">{order.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{order.items}</td>
                    <td className="py-4 px-6 text-white font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        statusConfig[order.status as keyof typeof statusConfig].color
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[order.status as keyof typeof statusConfig].label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'text-sm font-medium',
                        paymentConfig[order.payment as keyof typeof paymentConfig].color
                      )}>
                        {paymentConfig[order.payment as keyof typeof paymentConfig].label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {formatDate(order.date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
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
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-primary-800">
          <p className="text-gray-400 text-sm">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <IconButton disabled>
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <span className="px-3 py-1 bg-white text-black rounded text-sm font-medium">1</span>
            <IconButton disabled>
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Order ${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                statusConfig[selectedOrder.status as keyof typeof statusConfig].color
              )}>
                {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
              </span>
              <span className="text-gray-400 text-sm">
                {formatDate(selectedOrder.date)}
              </span>
            </div>

            {/* Customer info */}
            <div className="p-4 bg-primary-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Customer</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedOrder.customer.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.customer.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            <div className="p-4 bg-primary-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Shipping</h3>
              <p className="text-gray-300">{selectedOrder.shipping.method} Shipping</p>
              {selectedOrder.shipping.tracking && (
                <p className="text-gray-400 text-sm mt-1">
                  Tracking: {selectedOrder.shipping.tracking}
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="p-4 bg-primary-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Items ({selectedOrder.items})</span>
                  <span className="text-white">{formatCurrency(selectedOrder.total * 0.9)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-white">{formatCurrency(selectedOrder.total * 0.05)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span className="text-white">{formatCurrency(selectedOrder.total * 0.05)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-700">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {selectedOrder.status === 'pending' && (
                <Button className="flex-1">Process Order</Button>
              )}
              {selectedOrder.status === 'processing' && (
                <Button className="flex-1" leftIcon={<Truck className="h-4 w-4" />}>
                  Mark as Shipped
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button className="flex-1" leftIcon={<Package className="h-4 w-4" />}>
                  Mark as Delivered
                </Button>
              )}
              <Button variant="outline" className="flex-1">
                Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
