import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    orders: 12,
    totalSpent: 1589.00,
    lastOrder: '2025-01-25T10:30:00',
    status: 'active',
    avatar: 'J',
    joinedAt: '2024-06-15',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    phone: '+1 234 567 891',
    orders: 8,
    totalSpent: 982.00,
    lastOrder: '2025-01-24T14:20:00',
    status: 'active',
    avatar: 'S',
    joinedAt: '2024-08-22',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1 234 567 892',
    orders: 5,
    totalSpent: 445.00,
    lastOrder: '2025-01-20T09:15:00',
    status: 'active',
    avatar: 'M',
    joinedAt: '2024-10-01',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@example.com',
    phone: '+1 234 567 893',
    orders: 3,
    totalSpent: 329.00,
    lastOrder: '2025-01-15T16:45:00',
    status: 'inactive',
    avatar: 'E',
    joinedAt: '2024-11-10',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david@example.com',
    phone: '+1 234 567 894',
    orders: 1,
    totalSpent: 89.00,
    lastOrder: '2025-01-10T11:00:00',
    status: 'active',
    avatar: 'D',
    joinedAt: '2025-01-05',
  },
];

export function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);

  const openCustomerDetail = (customer: typeof customers[0]) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-gray-400">Manage your customer base</p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Download className="h-4 w-4" />} variant="outline">
            Export
          </Button>
          <Button leftIcon={<UserPlus className="h-4 w-4" />}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Total Customers</p>
          <p className="text-2xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {customers.filter((c) => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-blue-400">{totalOrders}</p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-primary-900 border border-primary-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((status) => (
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
              {status}
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
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Orders</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Total Spent</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Last Order</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-primary-800 last:border-0 hover:bg-primary-800/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                        {customer.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium">{customer.name}</p>
                        <p className="text-gray-500 text-sm">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white">{customer.orders}</td>
                  <td className="py-4 px-6 text-white font-medium">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {formatDate(customer.lastOrder, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                      customer.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    )}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton onClick={() => openCustomerDetail(customer)}>
                        <Eye className="h-4 w-4" />
                      </IconButton>
                      <IconButton>
                        <Mail className="h-4 w-4" />
                      </IconButton>
                      <IconButton>
                        <MoreVertical className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-primary-800">
          <p className="text-gray-400 text-sm">
            Showing {filteredCustomers.length} of {customers.length} customers
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

      {/* Customer Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                {selectedCustomer.avatar}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedCustomer.name}</h3>
                <p className="text-gray-400">{selectedCustomer.email}</p>
                <p className="text-gray-500 text-sm">{selectedCustomer.phone}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-primary-800 rounded-lg text-center">
                <ShoppingBag className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedCustomer.orders}</p>
                <p className="text-gray-400 text-sm">Orders</p>
              </div>
              <div className="p-4 bg-primary-800 rounded-lg text-center">
                <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatCurrency(selectedCustomer.totalSpent)}</p>
                <p className="text-gray-400 text-sm">Total Spent</p>
              </div>
              <div className="p-4 bg-primary-800 rounded-lg text-center">
                <DollarSign className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(selectedCustomer.totalSpent / selectedCustomer.orders || 0)}
                </p>
                <p className="text-gray-400 text-sm">Avg. Order</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 bg-primary-800 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Customer since</span>
                <span className="text-white">{formatDate(selectedCustomer.joinedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last order</span>
                <span className="text-white">{formatDate(selectedCustomer.lastOrder)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={cn(
                  'capitalize font-medium',
                  selectedCustomer.status === 'active' ? 'text-green-400' : 'text-gray-400'
                )}>
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" leftIcon={<Mail className="h-4 w-4" />}>
                Send Email
              </Button>
              <Button className="flex-1" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                View Orders
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
