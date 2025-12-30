import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ChevronLeft,
  AlertCircle,
  Wallet,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface WompiPaymentProps {
  total: number;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  customerEmail: string;
  shippingAddress?: {
    address: string;
    apartment?: string;
    city: string;
    state: string;
    country: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

export function WompiPayment({
  total,
  items,
  customerEmail,
  shippingAddress,
  onSuccess,
  onBack,
  isProcessing,
  setIsProcessing,
}: WompiPaymentProps) {
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');

      // Prepare shipping address for Wompi format
      const wompiShippingAddress = shippingAddress ? {
        address_line_1: shippingAddress.address,
        address_line_2: shippingAddress.apartment || '',
        country: shippingAddress.country,
        region: shippingAddress.state,
        city: shippingAddress.city,
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        phone_number: shippingAddress.phone,
      } : undefined;

      // Create transaction
      const response = await fetch(`${API_URL}/orders/wompi/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          customerEmail,
          shippingAddress: wompiShippingAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la transacción de pago');
      }

      const result = await response.json();
      const { id, checkout_url } = result.data;

      setTransactionId(id);

      // Redirect to Wompi checkout
      window.location.href = checkout_url;

      // Note: The success callback will be handled by the callback page
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Payment methods info */}
      <div className="mb-6 space-y-4">
        <div className="p-4 bg-primary-800 rounded-lg border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <CreditCard className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">Tarjetas de Débito y Crédito</h4>
              <p className="text-sm text-gray-400">
                Visa, Mastercard, American Express. Pago seguro con cuotas disponibles.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-800 rounded-lg border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <Smartphone className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">Nequi</h4>
              <p className="text-sm text-gray-400">
                Paga directamente desde tu celular con Nequi. Rápido y seguro.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-800 rounded-lg border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <Wallet className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">DaviPlata</h4>
              <p className="text-sm text-gray-400">
                Usa tu cuenta DaviPlata para pagar de forma instantánea.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-800 rounded-lg border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <Building2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">PSE - Transferencia Bancaria</h4>
              <p className="text-sm text-gray-400">
                Paga desde tu banco con PSE. Disponible para todos los bancos de Colombia.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-800 rounded-lg border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <Banknote className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-white mb-1">Bancolombia</h4>
              <p className="text-sm text-gray-400">
                Botón de pago Bancolombia, QR y Corresponsal Bancario disponibles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
        <Lock className="h-5 w-5 text-green-500" />
        <p className="text-green-400 text-sm">
          Tu pago está protegido por Wompi (Bancolombia). Todos los métodos de pago son seguros y encriptados.
        </p>
      </div>

      {/* Features */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-400 mb-2">Ventajas de pagar con Wompi:</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>✓ Propiedad de Bancolombia - Respaldado por el banco líder</li>
          <li>✓ Más de 17M de usuarios de DaviPlata</li>
          <li>✓ Pagos en cuotas con Bancolombia BNPL</li>
          <li>✓ Redime Puntos Colombia</li>
          <li>✓ Confirmación instantánea</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Volver
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handlePayment}
          isLoading={isProcessing}
          disabled={isProcessing}
          leftIcon={<Lock className="h-4 w-4" />}
        >
          Pagar {formatCurrency(total)} con Wompi
        </Button>
      </div>

      {/* Info about payment process */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>ℹ️ Importante:</strong> Serás redirigido a Wompi para completar tu pago de forma segura.
          Podrás elegir entre tarjeta, Nequi, DaviPlata, PSE o Bancolombia.
          Una vez completado el pago, regresarás automáticamente a nuestra tienda.
        </p>
      </div>
    </div>
  );
}
