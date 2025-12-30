import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  Percent,
  X,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { cn, formatCurrency } from '@/lib/utils';
import { couponService, type Coupon, type CreateCouponData } from '@/services/coupon.service';

export function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: undefined,
    max_discount: undefined,
    usage_limit: undefined,
    expires_at: undefined,
    starts_at: undefined,
    applicable_to: 'all',
    product_ids: [],
    active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, [statusFilter]);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await couponService.getAll({
        status: statusFilter,
        limit: 100,
      });
      setCoupons(response.data.coupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Error al cargar los cupones');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.active && (!c.expires_at || new Date(c.expires_at) > new Date())).length,
    used: coupons.reduce((sum, c) => sum + c.used_count, 0),
    totalDiscount: 0, // Esto se calcularía con datos de órdenes
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase: undefined,
      max_discount: undefined,
      usage_limit: undefined,
      expires_at: undefined,
      starts_at: undefined,
      applicable_to: 'all',
      product_ids: [],
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : undefined,
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : undefined,
      applicable_to: coupon.applicable_to,
      product_ids: coupon.product_ids,
      active: coupon.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.code.trim()) {
      toast.error('El código del cupón es requerido');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('El valor del descuento debe ser mayor a 0');
      return;
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      toast.error('El porcentaje no puede ser mayor a 100');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCoupon) {
        await couponService.update(editingCoupon.id, formData);
        toast.success('Cupón actualizado exitosamente');
      } else {
        await couponService.create(formData);
        toast.success('Cupón creado exitosamente');
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el cupón');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      await couponService.delete(id);
      toast.success('Cupón eliminado exitosamente');
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Error al eliminar el cupón');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    if (!coupon.active) {
      return { label: 'Inactivo', color: 'bg-gray-100 text-gray-800' };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { label: 'Expirado', color: 'bg-red-100 text-red-800' };
    }
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { label: 'Programado', color: 'bg-blue-100 text-blue-800' };
    }
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { label: 'Límite alcanzado', color: 'bg-orange-100 text-orange-800' };
    }
    return { label: 'Activo', color: 'bg-green-100 text-green-800' };
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
          <h1 className="text-2xl font-bold text-black">Cupones de Descuento</h1>
          <p className="text-gray-600">Crea y gestiona códigos de descuento</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Crear Cupón
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <p className="text-gray-600 text-sm font-medium">Total Cupones</p>
          </div>
          <p className="text-2xl font-bold text-black">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="text-gray-600 text-sm font-medium">Activos</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="h-5 w-5 text-purple-600" />
            <p className="text-gray-600 text-sm font-medium">Usos Totales</p>
          </div>
          <p className="text-2xl font-bold text-black">{stats.used}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            <p className="text-gray-600 text-sm font-medium">Descuento Total</p>
          </div>
          <p className="text-2xl font-bold text-black">{formatCurrency(stats.totalDiscount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cupones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'expired', 'scheduled'].map((status) => (
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
              {status === 'all' ? 'Todos' :
               status === 'active' ? 'Activos' :
               status === 'expired' ? 'Expirados' : 'Programados'}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">No hay cupones disponibles</h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer cupón de descuento para atraer más clientes.
          </p>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Crear Primer Cupón
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-black">Código</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-black">Descuento</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-black">Usos</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-black">Validez</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-black">Estado</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-black">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => {
                  const status = getStatusBadge(coupon);
                  return (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-black font-mono font-bold">{coupon.code}</span>
                          <IconButton onClick={() => handleCopyCode(coupon.code)} size="sm">
                            <Copy className="h-3 w-3" />
                          </IconButton>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-black font-medium">
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}%`
                            : formatCurrency(coupon.discount_value)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {coupon.used_count}
                          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {coupon.expires_at ? (
                            <>Expira: {new Date(coupon.expires_at).toLocaleDateString('es-CO')}</>
                          ) : (
                            'Sin expiración'
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                          status.color
                        )}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton onClick={() => openEditModal(coupon)}>
                            <Edit className="h-4 w-4" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(coupon.id)}>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Editar Cupón' : 'Crear Cupón'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Código del Cupón"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="VERANO2024"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Descuento"
              options={[
                { value: 'percentage', label: 'Porcentaje' },
                { value: 'fixed', label: 'Monto Fijo' },
              ]}
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
            />

            <Input
              label="Valor del Descuento"
              type="number"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
              placeholder={formData.discount_type === 'percentage' ? '10' : '5000'}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Compra Mínima (opcional)"
              type="number"
              value={formData.min_purchase || ''}
              onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="50000"
            />

            <Input
              label="Descuento Máximo (opcional)"
              type="number"
              value={formData.max_discount || ''}
              onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="20000"
            />
          </div>

          <Input
            label="Límite de Usos (opcional)"
            type="number"
            value={formData.usage_limit || ''}
            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="100"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio (opcional)"
              type="datetime-local"
              value={formData.starts_at || ''}
              onChange={(e) => setFormData({ ...formData, starts_at: e.target.value || undefined })}
            />

            <Input
              label="Fecha de Expiración (opcional)"
              type="datetime-local"
              value={formData.expires_at || ''}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || undefined })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="active" className="text-black font-medium cursor-pointer">
              Cupón activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="h-4 w-4" />}
            >
              {editingCoupon ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
