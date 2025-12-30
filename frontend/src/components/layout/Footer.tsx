import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

const footerLinks = {
  shop: [
    { name: 'Todos los Productos', href: '/shop' },
    { name: 'Nuevos Ingresos', href: '/shop?filter=new' },
    { name: 'Más Vendidos', href: '/shop?filter=best' },
    { name: 'Ofertas', href: '/shop?filter=sale' },
    { name: 'Tarjetas de Regalo', href: '/gift-cards' },
  ],
  support: [
    { name: 'Contáctanos', href: '/contact' },
    { name: 'Preguntas Frecuentes', href: '/faqs' },
    { name: 'Info de Envío', href: '/shipping' },
    { name: 'Devoluciones y Cambios', href: '/returns' },
    { name: 'Guía de Tallas', href: '/size-guide' },
  ],
  company: [
    { name: 'Sobre Nosotros', href: '/about' },
    { name: 'Trabaja con Nosotros', href: '/careers' },
    { name: 'Prensa', href: '/press' },
    { name: 'Sostenibilidad', href: '/sustainability' },
    { name: 'Ubicación de Tiendas', href: '/stores' },
  ],
  legal: [
    { name: 'Política de Privacidad', href: '/privacy' },
    { name: 'Términos de Servicio', href: '/terms' },
    { name: 'Política de Cookies', href: '/cookies' },
    { name: 'Accesibilidad', href: '/accessibility' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Youtube', icon: Youtube, href: 'https://youtube.com' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
    setEmail('');
  };

  return (
    <footer className="bg-black border-t border-primary-800">
      {/* Newsletter section */}
      <AnimatedSection animation="fadeUp">
        <div className="border-b border-primary-800">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Únete a la comunidad MELO SPORTT
              </h3>
              <p className="text-gray-400 mb-8">
                Suscríbete a nuestro boletín para ofertas exclusivas, nuevos productos e inspiración de estilo.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo"
                    required
                    className="w-full h-14 px-6 bg-primary-900 border border-primary-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 px-8 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubscribed ? (
                    '¡Suscrito!'
                  ) : (
                    <>
                      Suscribirse
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                Al suscribirte, aceptas nuestra Política de Privacidad y consientes recibir actualizaciones.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Main footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="MELO SPORTT" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-white tracking-wider">MELO SPORTT</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Moda premium para el individuo moderno. Descubre piezas atemporales creadas con atención al detalle.
            </p>

            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <a
                href="mailto:contacto@melosportt.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                contacto@melosportt.com
              </a>
              <a
                href="tel:+573001234567"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +57 300 123 4567
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Centro Histórico, Calle del Arsenal<br />Cartagena de Indias, Colombia</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-primary-900 text-gray-400 hover:text-white hover:bg-primary-800 rounded-full transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Tienda</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} MELO SPORTT. Todos los derechos reservados.
            </p>

            {/* Payment methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Aceptamos:</span>
              <div className="flex items-center gap-2">
                {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((method) => (
                  <div
                    key={method}
                    className="px-2 py-1 bg-primary-900 rounded text-xs text-gray-400"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}