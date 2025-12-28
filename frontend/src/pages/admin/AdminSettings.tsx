import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Bell,
  CreditCard,
  Truck,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Save,
  Upload,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Manage your store configuration</p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-primary-900 rounded-xl border border-primary-800 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-primary-800'
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-900 rounded-xl border border-primary-800 p-6"
          >
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>

                {/* Store logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Store Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-primary-800 rounded-xl flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">W</span>
                    </div>
                    <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
                      Upload New
                    </Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Nombre de la Tienda" defaultValue="MELO SPORTT" />
                  <Input label="Email de Contacto" type="email" defaultValue="contacto@melosportt.com" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Phone Number" type="tel" defaultValue="+1 234 567 890" />
                  <Input label="WhatsApp Number" type="tel" defaultValue="+1 234 567 890" />
                </div>

                <Textarea
                  label="Store Description"
                  defaultValue="Premium fashion for the modern individual. Discover timeless pieces crafted with attention to detail."
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Select label="Currency" options={currencies} defaultValue="USD" />
                  <Select label="Timezone" options={timezones} defaultValue="America/New_York" />
                </div>

                <Input label="Store Address" defaultValue="123 Fashion Street, New York, NY 10001" />
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Notification Settings</h2>

                <div className="space-y-4">
                  {[
                    { label: 'New order notifications', description: 'Receive email when a new order is placed', icon: Mail },
                    { label: 'Low stock alerts', description: 'Get notified when products are running low', icon: Bell },
                    { label: 'Customer messages', description: 'Receive notifications for new messages', icon: Smartphone },
                    { label: 'Review notifications', description: 'Get notified when customers leave reviews', icon: Bell },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary-700 rounded-lg">
                          <item.icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <Input
                  label="Email de Notificaciones"
                  type="email"
                  defaultValue="admin@melosportt.com"
                  hint="Todas las notificaciones se enviarán a este correo"
                />
              </div>
            )}

            {/* Payments */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Payment Settings</h2>

                {/* Stripe */}
                <div className="p-4 bg-primary-800 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#635BFF] rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Stripe</p>
                        <p className="text-green-400 text-sm flex items-center gap-1">
                          <Check className="h-3 w-3" /> Connected
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Input
                    label="Stripe Public Key"
                    type="password"
                    defaultValue="pk_live_xxxxxxxxxxxxxxxxxxxx"
                  />
                </div>

                {/* PayPal */}
                <div className="p-4 bg-primary-800 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#003087] rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">PayPal</p>
                        <p className="text-gray-400 text-sm">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Tax Rate (%)" type="number" defaultValue="8" />
                  <Select
                    label="Tax Calculation"
                    options={[
                      { value: 'inclusive', label: 'Tax Inclusive' },
                      { value: 'exclusive', label: 'Tax Exclusive' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Shipping */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Shipping Settings</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Free Shipping Threshold ($)" type="number" defaultValue="100" />
                  <Input label="Default Shipping Cost ($)" type="number" defaultValue="10" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Shipping Methods</h3>

                  {[
                    { name: 'Standard Shipping', price: 10, days: '5-7 days' },
                    { name: 'Express Shipping', price: 25, days: '2-3 days' },
                    { name: 'Overnight Shipping', price: 50, days: '1 day' },
                  ].map((method) => (
                    <div key={method.name} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{method.name}</p>
                        <p className="text-gray-400 text-sm">{method.days}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">${method.price}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">SEO Settings</h2>

                <Input
                  label="Título del Sitio"
                  defaultValue="MELO SPORTT - Moda Deportiva Premium"
                  hint="Aparece en resultados de búsqueda y pestañas del navegador"
                />

                <Textarea
                  label="Meta Descripción"
                  defaultValue="Descubre moda deportiva premium en MELO SPORTT. Compra las últimas tendencias en ropa, accesorios y más con envío gratis en compras mayores a $200.000."
                  hint="Recomendado: 150-160 caracteres"
                />

                <Input
                  label="Palabras Clave"
                  defaultValue="moda, ropa, deportiva, tienda, accesorios, Colombia"
                  hint="Separa las palabras clave con comas"
                />

                <div className="p-4 bg-primary-800 rounded-lg">
                  <h3 className="text-white font-medium mb-3">Vista Previa en Redes</h3>
                  <div className="border border-primary-700 rounded-lg overflow-hidden">
                    <div className="h-32 bg-primary-700"></div>
                    <div className="p-4">
                      <p className="text-blue-400 text-sm">melosportt.com</p>
                      <p className="text-white font-medium">MELO SPORTT - Moda Deportiva Premium</p>
                      <p className="text-gray-400 text-sm">Descubre moda deportiva premium en MELO SPORTT...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">SSL Certificate Active</p>
                      <p className="text-gray-400 text-sm">Your store is protected with HTTPS encryption</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Two-factor authentication', description: 'Add an extra layer of security to admin accounts', enabled: true },
                    { label: 'Login notifications', description: 'Get notified of new admin logins', enabled: true },
                    { label: 'IP restriction', description: 'Limit admin access to specific IP addresses', enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400/10">
                  Change Admin Password
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
