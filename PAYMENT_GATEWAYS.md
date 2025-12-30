# Pasarelas de Pago - MELO SPORTT

Este proyecto soporta **tres pasarelas de pago** para Colombia:

1. **Mercado Pago** ✅ (Recomendado)
2. **Wompi** ✅ (Bancolombia)
3. **Pago Contra Entrega** ✅

---

## 🌟 Comparación de Pasarelas

### Mercado Pago (Recomendado)
**Ventajas:**
- ✅ Más reconocido en Latinoamérica
- ✅ Integrado con Mercado Libre
- ✅ Tarifas desde 2.99% + IVA
- ✅ Protección al comprador y vendedor
- ✅ Soporte para múltiples países

**Métodos de pago incluidos:**
- Tarjetas débito/crédito (Visa, Mastercard)
- PSE (transferencias bancarias)
- Nequi (a través de PSE)
- Daviplata (a través de PSE)
- Efecty (pagos en efectivo)

**Documentación:** https://www.mercadopago.com.co/developers

---

### Wompi (Bancolombia)
**Ventajas:**
- ✅ Propiedad de Bancolombia (respaldo bancario sólido)
- ✅ Integración directa con DaviPlata (17M+ usuarios)
- ✅ Bancolombia BNPL (compra ahora, paga después)
- ✅ Redención de Puntos Colombia
- ✅ QR Bancolombia y Corresponsal Bancario
- ✅ Más métodos locales colombianos

**Métodos de pago incluidos:**
- Tarjetas débito/crédito (Visa, Mastercard, Amex)
- PSE (todos los bancos de Colombia)
- Nequi (integración directa)
- DaviPlata (integración directa)
- Botón de pago Bancolombia
- Corresponsal Bancario (15,000+ puntos físicos)
- BNPL Bancolombia (cuotas sin interés)
- QR Bancolombia
- Puntos Colombia

**Documentación:** https://docs.wompi.co

---

## 🔧 Configuración

### 1. Mercado Pago

#### Paso 1: Crear cuenta en Mercado Pago
1. Ve a https://www.mercadopago.com.co
2. Crea una cuenta como vendedor
3. Completa la verificación de identidad

#### Paso 2: Obtener credenciales
1. Ve a https://www.mercadopago.com.co/developers/panel
2. Crea una aplicación
3. Obtén tus credenciales:
   - **Public Key** (para frontend)
   - **Access Token** (para backend)

#### Paso 3: Configurar variables de entorno
```bash
# Backend .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret # Opcional
```

#### Paso 4: Configurar Webhook (opcional)
1. En tu panel de Mercado Pago, ve a "Webhooks"
2. Agrega la URL: `https://tu-dominio.com/api/orders/mercadopago/webhook`
3. Selecciona eventos: `payment`

---

### 2. Wompi

#### Paso 1: Crear cuenta en Wompi
1. Ve a https://comercios.wompi.co/
2. Registra tu negocio
3. Completa la verificación (requiere documentos de la empresa)

#### Paso 2: Obtener credenciales
1. Accede a tu Dashboard de Wompi
2. Ve a "Configuración" → "API Keys"
3. Obtén tus credenciales:
   - **Public Key** (pub_test_xxx o pub_prod_xxx)
   - **Private Key** (prv_test_xxx o prv_prod_xxx)
   - **Events Secret** (para webhooks)
   - **Integrity Secret** (para validar transacciones)

#### Paso 3: Configurar variables de entorno
```bash
# Backend .env
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxx
WOMPI_EVENTS_SECRET=test_events_xxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxxxxxxxxxxx
```

#### Paso 4: Configurar Webhook
1. En tu panel de Wompi, ve a "Webhooks"
2. Agrega la URL: `https://tu-dominio.com/api/orders/wompi/webhook`
3. Selecciona eventos: `transaction.updated`

---

## 🚀 Modo de Prueba (Sandbox)

### Mercado Pago - Modo Sandbox

**Tarjetas de prueba:**
- **Visa aprobada:** 4509 9535 6623 3704
- **Mastercard aprobada:** 5031 7557 3453 0604
- **American Express aprobada:** 3711 803032 57522
- **CVV:** 123
- **Fecha de vencimiento:** Cualquier fecha futura
- **Nombre:** APRO (para aprobar) o OTHE (para rechazar)

**Más tarjetas de prueba:**
https://www.mercadopago.com.co/developers/es/docs/checkout-api/testing

---

### Wompi - Modo Sandbox

**Tarjetas de prueba:**
- **Visa aprobada:** 4242 4242 4242 4242
- **Mastercard aprobada:** 5555 5555 5555 4444
- **CVV:** 123
- **Fecha de vencimiento:** Cualquier fecha futura

**Nequi (Sandbox):**
- Teléfono: 3209876543
- PIN: 1234

**DaviPlata (Sandbox):**
- Teléfono: 3001234567
- Clave: 1234

**PSE (Sandbox):**
- Selecciona "Banco de Pruebas"
- Usuario: cualquier valor
- Contraseña: cualquier valor

**Más información:**
https://docs.wompi.co/en/docs/colombia/ambientes-de-prueba/

---

## 📱 Flujo de Pago

### Para el Usuario:

1. **Selecciona productos** y agrega al carrito
2. **Va al checkout** e ingresa información de envío
3. **Elige método de pago:**
   - **Mercado Pago** → Redirigido a checkout de Mercado Pago
   - **Wompi** → Redirigido a checkout de Wompi
   - **Pago Contra Entrega** → Confirmación inmediata
4. **Completa el pago** en la pasarela seleccionada
5. **Regresa automáticamente** a la tienda
6. **Ve confirmación** del pedido

---

## 🔐 Seguridad

### Ambas pasarelas implementan:

✅ **Encriptación SSL/TLS** - Todos los datos viajan encriptados
✅ **Tokenización** - No se almacenan datos de tarjetas
✅ **3D Secure** - Autenticación adicional cuando es requerida
✅ **PCI DSS Compliance** - Cumplimiento de estándares de seguridad
✅ **Detección de fraude** - Sistemas de prevención activos
✅ **Webhooks seguros** - Validación de firmas

---

## 💰 Tarifas (Aproximadas para Colombia)

### Mercado Pago
- Tarjetas nacionales: **2.99% + IVA**
- Tarjetas internacionales: **3.99% + IVA**
- PSE: **3.99% + IVA**
- Sin comisión mensual

### Wompi
- Tarjetas nacionales: **2.99% + IVA**
- Tarjetas internacionales: **3.99% + IVA**
- PSE: **1.99% + IVA**
- Nequi/DaviPlata: **1.49% + IVA**
- Sin comisión mensual

*Nota: Las tarifas pueden variar según tu volumen de transacciones y tipo de negocio.*

---

## 🧪 Testing en Desarrollo

Si no configuras las credenciales, ambas pasarelas funcionan en **modo simulado**:

- ✅ No requiere credenciales reales
- ✅ Genera transacciones de prueba
- ✅ Perfecto para desarrollo local
- ✅ Los pagos se aprueban automáticamente

Para activar el modo real, simplemente configura las variables de entorno.

---

## 📊 ¿Cuál elegir?

### Usa **Mercado Pago** si:
- Necesitas alcance en múltiples países de Latinoamérica
- Tus clientes ya conocen/usan Mercado Libre
- Quieres protección al comprador reconocida
- Necesitas integración con Mercado Libre

### Usa **Wompi** si:
- Tus clientes son principalmente colombianos
- Quieres aprovechar DaviPlata (17M+ usuarios)
- Necesitas Bancolombia BNPL (cuotas)
- Quieres tarifas más bajas para PSE/Nequi/DaviPlata
- Necesitas pagos en puntos físicos (Corresponsal Bancario)

### Usa **Ambas** si:
- Quieres maximizar conversión
- Ofreces redundancia (si una falla, tienes respaldo)
- Permites al usuario elegir su preferencia
- Quieres aprovechar las ventajas de cada una

---

## 🆘 Soporte

### Mercado Pago
- Documentación: https://www.mercadopago.com.co/developers
- Soporte: https://www.mercadopago.com.co/ayuda
- Estado del servicio: https://status.mercadopago.com

### Wompi
- Documentación: https://docs.wompi.co
- Soporte: soporte@wompi.co
- WhatsApp: +57 300 939 9999

---

## 📝 Notas Adicionales

1. **Tiempo de implementación:** Ambas pasarelas están completamente implementadas
2. **Modo producción:** Solo necesitas agregar las credenciales reales
3. **Testing:** Funciona sin credenciales en modo simulado
4. **Webhooks:** Configurar en producción para confirmación automática
5. **Monitoreo:** Revisa los logs del backend para debugging

---

**Implementado con ❤️ para MELO SPORTT**
