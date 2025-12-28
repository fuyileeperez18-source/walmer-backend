import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const revenueData = [
  { name: 'Jan', revenue: 4000, orders: 24, visitors: 1200 },
  { name: 'Feb', revenue: 3000, orders: 18, visitors: 1100 },
  { name: 'Mar', revenue: 5000, orders: 32, visitors: 1400 },
  { name: 'Apr', revenue: 4500, orders: 28, visitors: 1300 },
  { name: 'May', revenue: 6000, orders: 38, visitors: 1600 },
  { name: 'Jun', revenue: 5500, orders: 35, visitors: 1500 },
  { name: 'Jul', revenue: 7000, orders: 45, visitors: 1800 },
];

const categoryData = [
  { name: 'T-Shirts', value: 35, color: '#ffffff' },
  { name: 'Jackets', value: 25, color: '#a3a3a3' },
  { name: 'Pants', value: 20, color: '#737373' },
  { name: 'Accessories', value: 20, color: '#525252' },
];

const trafficSources = [
  { name: 'Organic Search', value: 40, color: '#10b981' },
  { name: 'Direct', value: 25, color: '#3b82f6' },
  { name: 'Social Media', value: 20, color: '#8b5cf6' },
  { name: 'Referral', value: 10, color: '#f59e0b' },
  { name: 'Email', value: 5, color: '#ef4444' },
];

const topProducts = [
  { name: 'Essential Cotton Tee', sales: 245, revenue: 12005 },
  { name: 'Urban Denim Jacket', sales: 189, revenue: 35721 },
  { name: 'Slim Fit Chinos', sales: 156, revenue: 13884 },
  { name: 'Premium Leather Belt', sales: 134, revenue: 7906 },
  { name: 'Minimalist Watch', sales: 98, revenue: 14602 },
];

const conversionData = [
  { name: 'Mon', rate: 3.2 },
  { name: 'Tue', rate: 3.5 },
  { name: 'Wed', rate: 3.1 },
  { name: 'Thu', rate: 3.8 },
  { name: 'Fri', rate: 4.2 },
  { name: 'Sat', rate: 4.5 },
  { name: 'Sun', rate: 3.9 },
];

const timeRanges = ['7 days', '30 days', '90 days', '12 months'];

export function AdminAnalytics() {
  const [selectedRange, setSelectedRange] = useState('30 days');

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(35000),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '165',
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Total Visitors',
      value: '8,942',
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: Eye,
    },
    {
      title: 'Conversion Rate',
      value: '3.7%',
      change: '-0.5%',
      changeType: 'decrease' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Track your store performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-primary-900 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedRange === range
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-primary-900 rounded-xl p-6 border border-primary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-800 rounded-lg">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className={cn(
                'flex items-center gap-1 text-sm font-medium',
                stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
              )}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{stat.title}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-primary-900 rounded-xl p-6 border border-primary-800">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue & Orders</h3>
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
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ffffff"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
          <h3 className="text-lg font-semibold text-white mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-400 text-sm">{item.name}</span>
                <span className="text-white text-sm ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
          <h3 className="text-lg font-semibold text-white mb-6">Traffic Sources</h3>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">{source.name}</span>
                  <span className="text-white font-medium">{source.value}%</span>
                </div>
                <div className="h-2 bg-primary-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${source.value}%`, backgroundColor: source.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
          <h3 className="text-lg font-semibold text-white mb-6">Conversion Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="rate" fill="#ffffff" radius={[4, 4, 0, 0]} name="Conversion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-primary-900 rounded-xl p-6 border border-primary-800">
        <h3 className="text-lg font-semibold text-white mb-6">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Product</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Sales</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => {
                const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
                const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);
                return (
                  <tr key={product.name} className="border-b border-primary-800 last:border-0">
                    <td className="py-4 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-4 px-4 text-white font-medium">{product.name}</td>
                    <td className="py-4 px-4 text-right text-gray-300">{product.sales}</td>
                    <td className="py-4 px-4 text-right text-white font-medium">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-primary-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
