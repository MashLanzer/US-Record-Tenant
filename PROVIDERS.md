# Proveedores externos recomendados (ítems 💳 del roadmap)

Para cada necesidad: **recomendado**, alternativas, coste aproximado y por qué.
Construyo la integración con el recomendado (con modo simulado hasta que
pongas las llaves), salvo que elijas otro.

---

## 1. Identidad / KYC (Fase 8.1–8.2)
Verificar ID gubernamental + selfie/liveness.

- **Recomendado: Stripe Identity** — fácil de integrar, ~US$1.50/verificación, buena UX, mismo ecosistema si luego usamos Stripe para pagos.
- Alternativas: **Persona** (muy flexible, mejor para flujos complejos), **Onfido**, **Veriff**.
- Por qué Stripe Identity: menor fricción de integración y un solo proveedor para identidad + pagos.

## 2. Ingresos / empleo (Fase 8.4)
Verificar ingresos y empleo del inquilino.

- **Recomendado: Plaid (Income)** — conexión bancaria, verificación de ingresos y depósitos de nómina.
- Alternativas: **Argyle** (datos de nómina directos), **The Work Number** (Equifax, empleo).
- Por qué Plaid: estándar de facto, mismo proveedor sirve para verificar pagos de renta (Fase 12.2).

## 3. Verificación de propiedad del landlord (Fase 8.3)
Confirmar que el landlord es dueño del inmueble.

- **Recomendado: subida de deed/tax record + revisión manual** al inicio (barato, sin proveedor).
- Escalable después con: **CoreLogic**, **ATTOM Data**, **Estated** (APIs de datos de propiedad, de pago).

## 4. Pagos de renta (Fase 12.1)
Cobrar/mover renta.

- **Recomendado: Stripe** (tarjetas + ACH) para empezar; **Dwolla** o **Plaid Transfer** si el volumen ACH crece.
- Coste: Stripe ACH ~0.8% (tope US$5), tarjeta 2.9%+30¢.
- Por qué Stripe: rápido de integrar, y ya lo usamos para identidad.

## 5. Reporte de renta a burós (Fase 12.5)
Reportar pagos de renta a burós de crédito.

- **Recomendado: partner tipo LevelCredit / Esusu / Boom** (agregan a Equifax/Experian/TransUnion).
- Nota: reportar directo a burós requiere acuerdos y cumplimiento estricto (Metro 2, FCRA como *furnisher*). 🧑‍⚖️

## 6. SMS / OTP (Fase 10.1–10.2)
Códigos de verificación por SMS y 2FA.

- **Recomendado: Twilio Verify** — maneja OTP, reintentos y fraude por ti.
- Alternativas: **Supabase Auth phone** (usa Twilio/MessageBird por debajo), **Vonage**.
- Por qué: Supabase ya soporta phone auth con Twilio → integración mínima.

## 7. Email transaccional (Fase 16.2)
Verificación, avisos, adverse action notices.

- **Recomendado: Resend** (DX excelente, plantillas React) o **Postmark** (mejor entregabilidad transaccional).
- Alternativas: **SendGrid**, **AWS SES** (más barato a escala, más setup).
- Nota: Supabase envía emails de auth, pero para avisos legales conviene un proveedor propio con registro de envío.

## 8. Firma electrónica (Fase 14.2)
Firmar contratos (ESIGN Act).

- **Recomendado: Documenso** (open-source, self-host posible) o **Dropbox Sign** (ex-HelloSign) por API simple.
- Alternativa: **DocuSign** (estándar, más caro).

## 9. Background / criminal check (Fase 11, opcional y sensible) 🧑‍⚖️
- **Recomendado: Checkr** o **TransUnion SmartMove** — CRAs reales, ya cumplen FCRA.
- ⚠️ Muy delicado: activa obligaciones FCRA completas (permissible purpose, adverse action, disputas). Solo con abogado.

## 10. Observabilidad (Fase 17.2)
- **Errores: Sentry** (plan gratuito generoso).
- **Analytics de producto: PostHog** (open-source, self-host posible).

---

## Resumen de "stack" sugerido para arrancar barato
Stripe (identidad + pagos) · Plaid (ingresos + verificación de pagos) ·
Twilio Verify (OTP) vía Supabase · Resend (email) · Documenso (e-firma) ·
Sentry + PostHog (observabilidad).

> Ninguno se activa hasta que tengas la cuenta y me pases las llaves. Mientras
> tanto construyo cada flujo con un **modo simulado** para que sea probable y
> revisable sin coste.
