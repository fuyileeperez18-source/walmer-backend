import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, IconButton } from '@/components/ui/Button';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { UploadedImage } from '@/components/ui/ImageUpload';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { productService, categoryService } from '@/lib/services';
import type { Product, Category } from '@/types';

const genderOptions = [
  { value: '', label: 'Seleccionar Genero' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'nino', label: 'Nino' },
  { value: 'nina', label: 'Nina' },
];

const productTypeOptions = [
  { value: '', label: 'Seleccionar Tipo' },
  { value: 'camiseta', label: 'Camiseta' },
  { value: 'camisa', label: 'Camisa' },
  { value: 'pantalon', label: 'Pantalon' },
  { value: 'chaqueta', label: 'Chaqueta' },
  { value: 'sudadera', label: 'Sudadera' },
  { value: 'short', label: 'Short' },
  { value: 'accesorio', label: 'Accesorio' },
  { value: 'zapato', label: 'Zapato' },
  { value: 'vestido', label: 'Vestido' },
  { value: 'falda', label: 'Falda' },
  { value: 'otro', label: 'Otro' },
];

const sizeOptions = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: '28', label: '28' },
  { value: '30', label: '30' },
  { value: '32', label: '32' },
  { value: '34', label: '34' },
  { value: '36', label: '36' },
  { value: '38', label: '38' },
  { value: '40', label: '40' },
  { value: '42', label: '42' },
];

const colorOptions = [
  { value: 'Negro', label: 'Negro', color: '#000000' },
  { value: 'Blanco', label: 'Blanco', color: '#FFFFFF' },
  { value: 'Gris', label: 'Gris', color: '#808080' },
  { value: 'Azul', label: 'Azul', color: '#0066CC' },
  { value: 'Rojo', label: 'Rojo', color: '#CC0000' },
  { value: 'Verde', label: 'Verde', color: '#006600' },
  { value: 'Amarillo', label: 'Amarillo', color: '#FFCC00' },
  { value: 'Rosa', label: 'Rosa', color: '#FF66B2' },
  { value: 'Morado', label: 'Morado', color: '#660099' },
  { value: 'Naranja', label: 'Naranja', color: '#FF6600' },
  { value: 'Marron', label: 'Marron', color: '#663300' },
  { value: 'Beige', label: 'Beige', color: '#F5DEB3' },
];

const materialOptions = [
  { value: '', label: 'Seleccionar Material' },
  { value: 'Algodon', label: 'Algodon' },
  { value: 'Poliester', label: 'Poliester' },
  { value: 'Algodon/Poliester', label: 'Algodon/Poliester' },
  { value: 'Lana', label: 'Lana' },
  { value: 'Seda', label: 'Seda' },
  { value: 'Lino', label: 'Lino' },
  { value: 'Denim', label: 'Denim' },
  { value: 'Cuero', label: 'Cuero' },
  { value: 'Sintetico', label: 'Sintetico' },
  { value: 'Nylon', label: 'Nylon' },
  { value: 'Spandex', label: 'Spandex' },
];

const getStatusConfig = (product: Product) => {
  if (!product.is_active) {
    return { label: 'Inactivo', color: 'bg-gray-500/20 text-gray-400' };
  }
  if (product.quantity === 0) {
    return { label: 'Sin Stock', color: 'bg-red-500/20 text-red-400' };
  }
  if (product.quantity <= 10) {
    return { label: 'Bajo Stock', color: 'bg-yellow-500/20 text-yellow-400' };
  }
  return { label: 'Activo', color: 'bg-green-500/20 text-green-400' };
};

interface FormData {
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  costPerItem: string;
  category: string;
  productType: string;
  gender: string;
  stock: string;
  brand: string;
  material: string;
  weight: string;
  colors: string[];
  sizes: string[];
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  sku: '',
  description: '',
  shortDescription: '',
  price: '',
  comparePrice: '',
  costPerItem: '',
  category: '',
  productType: '',
  gender: '',
  stock: '',
  brand: '',
  material: '',
  weight: '',
  colors: [],
  sizes: [],
  tags: '',
  isFeatured: false,
  isActive: true,
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const itemsPerPage = 10;

  // Cargar productos y categorias
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Usar getAllAdmin para obtener todos los productos incluyendo inactivos
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllAdmin ? productService.getAllAdmin() : productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productService.delete(selectedProduct.id);
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.short_description || '',
      price: product.price?.toString() || '',
      comparePrice: product.compare_at_price?.toString() || '',
      costPerItem: product.cost_per_item?.toString() || '',
      category: product.category_id || '',
      productType: product.product_type || '',
      gender: product.gender || '',
      stock: product.quantity?.toString() || '',
      brand: product.brand || '',
      material: product.material || '',
      weight: product.weight?.toString() || '',
      colors: product.colors || [],
      sizes: product.sizes || [],
      tags: product.tags?.join(', ') || '',
      isFeatured: product.is_featured || false,
      isActive: product.is_active ?? true,
    });
    setProductImages(
      product.images?.map((img) => ({
        id: img.id,
        url: img.url,
        alt_text: img.alt_text,
        position: img.position,
        is_primary: img.is_primary,
      })) || []
    );
    setIsEditModalOpen(true);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setProductImages([]);
    setSelectedProduct(null);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    if (productImages.length === 0) {
      toast.error('Por favor sube al menos una imagen');
      return;
    }

    if (!formData.gender) {
      toast.error('Por favor selecciona el genero');
      return;
    }

    if (!formData.productType) {
      toast.error('Por favor selecciona el tipo de producto');
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const productData: Partial<Product> = {
        name: formData.name,
        slug: slug + '-' + Date.now(),
        description: formData.description,
        short_description: formData.shortDescription,
        price: parseFloat(formData.price),
        compare_at_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost_per_item: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
        sku: formData.sku || `SKU-${Date.now()}`,
        quantity: parseInt(formData.stock) || 0,
        category_id: formData.category,
        brand: formData.brand || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        gender: formData.gender as Product['gender'],
        product_type: formData.productType as Product['product_type'],
        sizes: formData.sizes,
        colors: formData.colors,
        material: formData.material || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      const newProduct = await productService.create(productData);

      // Agregar las imagenes al producto
      if (productImages.length > 0 && newProduct.id) {
        for (const img of productImages) {
          try {
            await productService.addImage(newProduct.id, {
              url: img.url,
              alt_text: img.alt_text || productData.name,
              position: img.position,
              is_primary: img.is_primary,
            });
          } catch (imgError) {
            console.error('Error adding image to product:', imgError);
          }
        }
      }

      setProducts([newProduct, ...products]);
      toast.success('Producto creado correctamente');
      setIsAddModalOpen(false);
      resetForm();
      loadData(); // Recargar para obtener imagenes
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        short_description: formData.shortDescription,
        price: parseFloat(formData.price),
        compare_at_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost_per_item: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
        sku: formData.sku,
        quantity: parseInt(formData.stock) || 0,
        category_id: formData.category,
        brand: formData.brand || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        gender: formData.gender as Product['gender'],
        product_type: formData.productType as Product['product_type'],
        sizes: formData.sizes,
        colors: formData.colors,
        material: formData.material || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      const updatedProduct = await productService.update(selectedProduct.id, productData);
      setProducts(products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)));
      toast.success('Producto actualizado correctamente');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    resetForm();
  };

  const categoryOptions = [
    { value: '', label: 'Todas las Categorias' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const getPrimaryImage = (product: Product) => {
    const primary = product.images?.find((img) => img.is_primary);
    return primary?.url || product.images?.[0]?.url || 'https://via.placeholder.com/100';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-gray-400">Gestiona tu catalogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Actualizar
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsAddModalOpen(true)}>
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-primary-900 border border-primary-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 px-4 bg-primary-900 border border-primary-800 rounded-lg text-white focus:outline-none focus:border-white/30"
        >
          {categoryOptions.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Total Productos</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Activos</p>
          <p className="text-2xl font-bold text-green-400">
            {products.filter((p) => p.is_active && p.quantity > 0).length}
          </p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Bajo Stock</p>
          <p className="text-2xl font-bold text-yellow-400">
            {products.filter((p) => p.quantity > 0 && p.quantity <= 10).length}
          </p>
        </div>
        <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
          <p className="text-gray-400 text-sm">Sin Stock</p>
          <p className="text-2xl font-bold text-red-400">
            {products.filter((p) => p.quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-primary-900 rounded-xl border border-primary-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-800">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Producto</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">SKU</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Categoria</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Precio</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Stock</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Estado</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const status = getStatusConfig(product);
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-primary-800 last:border-0 hover:bg-primary-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPrimaryImage(product)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="text-white font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-400">{product.sku}</td>
                      <td className="py-4 px-6 text-gray-300">
                        {product.category?.name || 'Sin categoria'}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-white font-medium">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-gray-500 line-through text-sm ml-2">
                              {formatCurrency(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            'font-medium',
                            product.quantity === 0
                              ? 'text-red-400'
                              : product.quantity <= 10
                              ? 'text-yellow-400'
                              : 'text-white'
                          )}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            onClick={() =>
                              window.open(`/product/${product.slug}`, '_blank')
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </IconButton>
                          <IconButton onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-primary-800">
          <p className="text-gray-400 text-sm">
            Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
          </p>
          <div className="flex items-center gap-2">
            <IconButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {page}
              </button>
            ))}
            <IconButton
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Agregar Nuevo Producto"
        size="lg"
      >
        <ProductForm
          formData={formData}
          productImages={productImages}
          categories={categoryOptions.filter((c) => c.value !== '')}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onSizeToggle={handleSizeToggle}
          onColorToggle={handleColorToggle}
          onImagesChange={setProductImages}
          onSubmit={handleSubmitProduct}
          onCancel={handleCloseAddModal}
          submitLabel="Agregar Producto"
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Producto"
        size="lg"
      >
        <ProductForm
          formData={formData}
          productImages={productImages}
          categories={categoryOptions.filter((c) => c.value !== '')}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onSizeToggle={handleSizeToggle}
          onColorToggle={handleColorToggle}
          onImagesChange={setProductImages}
          onSubmit={handleUpdateProduct}
          onCancel={handleCloseEditModal}
          submitLabel="Guardar Cambios"
          productId={selectedProduct?.id}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`Estas seguro de que deseas eliminar "${selectedProduct?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}

// Componente de formulario separado para reutilizar
interface ProductFormProps {
  formData: FormData;
  productImages: UploadedImage[];
  categories: { value: string; label: string }[];
  isSubmitting: boolean;
  onInputChange: (field: keyof FormData, value: string | boolean | string[]) => void;
  onSizeToggle: (size: string) => void;
  onColorToggle: (color: string) => void;
  onImagesChange: (images: UploadedImage[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  productId?: string;
}

function ProductForm({
  formData,
  productImages,
  categories,
  isSubmitting,
  onInputChange,
  onSizeToggle,
  onColorToggle,
  onImagesChange,
  onSubmit,
  onCancel,
  submitLabel,
  productId,
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Informacion Basica */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Informacion Basica</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nombre del Producto *"
            placeholder="Camiseta Algodon Premium"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
          />
          <Input
            label="SKU"
            placeholder="CAP-001 (se genera automaticamente)"
            value={formData.sku}
            onChange={(e) => onInputChange('sku', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Descripcion Corta"
            placeholder="Breve descripcion para listados"
            value={formData.shortDescription}
            onChange={(e) => onInputChange('shortDescription', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Descripcion Completa"
            placeholder="Descripcion detallada del producto..."
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
          />
        </div>
      </div>

      {/* Clasificacion */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Clasificacion</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Categoria *"
            options={categories}
            value={formData.category}
            onChange={(e) => onInputChange('category', e.target.value)}
          />
          <Select
            label="Tipo de Producto *"
            options={productTypeOptions}
            value={formData.productType}
            onChange={(e) => onInputChange('productType', e.target.value)}
          />
          <Select
            label="Genero *"
            options={genderOptions}
            value={formData.gender}
            onChange={(e) => onInputChange('gender', e.target.value)}
          />
          <Input
            label="Marca"
            placeholder="Nike, Adidas, etc."
            value={formData.brand}
            onChange={(e) => onInputChange('brand', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Input
            label="Etiquetas (separadas por coma)"
            placeholder="deportivo, casual, verano, oferta"
            value={formData.tags}
            onChange={(e) => onInputChange('tags', e.target.value)}
          />
        </div>
      </div>

      {/* Precios e Inventario */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Precios e Inventario</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Precio (COP) *"
            type="number"
            placeholder="89000"
            value={formData.price}
            onChange={(e) => onInputChange('price', e.target.value)}
            required
          />
          <Input
            label="Precio Anterior (COP)"
            type="number"
            placeholder="120000"
            value={formData.comparePrice}
            onChange={(e) => onInputChange('comparePrice', e.target.value)}
            hint="Para mostrar descuento"
          />
          <Input
            label="Costo por Unidad"
            type="number"
            placeholder="50000"
            value={formData.costPerItem}
            onChange={(e) => onInputChange('costPerItem', e.target.value)}
            hint="Para calcular ganancias"
          />
          <Input
            label="Stock Disponible"
            type="number"
            placeholder="100"
            value={formData.stock}
            onChange={(e) => onInputChange('stock', e.target.value)}
          />
        </div>
      </div>

      {/* Especificaciones */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Especificaciones</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Material"
            options={materialOptions}
            value={formData.material}
            onChange={(e) => onInputChange('material', e.target.value)}
          />
          <Input
            label="Peso (gramos)"
            type="number"
            placeholder="250"
            value={formData.weight}
            onChange={(e) => onInputChange('weight', e.target.value)}
          />
        </div>
      </div>

      {/* Tallas */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Tallas Disponibles</h3>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <label
              key={size.value}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors border',
                formData.sizes.includes(size.value)
                  ? 'bg-white text-black border-white'
                  : 'bg-primary-800 hover:bg-primary-700 border-primary-700'
              )}
            >
              <input
                type="checkbox"
                checked={formData.sizes.includes(size.value)}
                onChange={() => onSizeToggle(size.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  formData.sizes.includes(size.value) ? 'text-black' : 'text-white'
                )}
              >
                {size.label}
              </span>
            </label>
          ))}
        </div>
        {formData.sizes.length > 0 && (
          <p className="text-gray-400 text-sm mt-2">
            Seleccionadas: {formData.sizes.join(', ')}
          </p>
        )}
      </div>

      {/* Colores */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Colores Disponibles</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <label
              key={color.value}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border',
                formData.colors.includes(color.value)
                  ? 'bg-white text-black border-white'
                  : 'bg-primary-800 hover:bg-primary-700 border-primary-700'
              )}
            >
              <input
                type="checkbox"
                checked={formData.colors.includes(color.value)}
                onChange={() => onColorToggle(color.value)}
                className="sr-only"
              />
              <span
                className="w-4 h-4 rounded-full border border-gray-400"
                style={{ backgroundColor: color.color }}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  formData.colors.includes(color.value) ? 'text-black' : 'text-white'
                )}
              >
                {color.label}
              </span>
            </label>
          ))}
        </div>
        {formData.colors.length > 0 && (
          <p className="text-gray-400 text-sm mt-2">
            Seleccionados: {formData.colors.join(', ')}
          </p>
        )}
      </div>

      {/* Imagenes */}
      <div className="border-b border-primary-800 pb-4">
        <h3 className="text-lg font-semibold text-white mb-4">Imagenes del Producto *</h3>
        <ImageUpload
          images={productImages}
          onChange={onImagesChange}
          maxImages={10}
          productId={productId}
        />
      </div>

      {/* Opciones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Opciones de Publicacion</h3>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onInputChange('isActive', e.target.checked)}
              className="w-5 h-5 rounded border-primary-700 bg-primary-900 text-white"
            />
            <span className="text-gray-300">Producto activo (visible en tienda)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => onInputChange('isFeatured', e.target.checked)}
              className="w-5 h-5 rounded border-primary-700 bg-primary-900 text-white"
            />
            <span className="text-gray-300">Producto destacado (aparece en inicio)</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4 sticky bottom-0 bg-primary-900 py-4 -mb-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
