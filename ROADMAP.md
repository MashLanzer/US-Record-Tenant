# Tenant Trust — Roadmap maestro a producción (v1.0 legal-grade)

> Esta app maneja datos personales sensibles y decisiones con impacto legal.
> Un error de cumplimiento no es un bug estético: puede significar demandas,
> multas (FCRA, Fair Housing) o daño real a personas. Por eso este plan pone
> **primero los cimientos legales, de seguridad e integridad de datos**, y
> deja el pulido para el final.

## Leyenda de dependencias

- 🧑‍⚖️ **Requiere abogado real** — no se puede "codear" solo; necesita revisión/asesoría legal.
- 💳 **Requiere servicio externo de pago** — cuenta/contrato con un tercero (Stripe, Plaid, Persona, burós…). Yo construyo la integración; la activación es tuya.
- 🔧 **Construible por completo aquí** — lo puedo implementar de punta a punta en la app.
- ⏳ **Estado:** `pendiente` salvo lo marcado.

---

## ✅ Ya construido (plan v0.5 → v1.0 base)

- **Fase 1** — Relación bilateral: invitar, confirmar, hechos+evidencia, calificaciones, disputas.
- **Fase 2** — Cuenta: editar perfil, contraseña, preferencias persistentes, páginas legales.
- **Fase 3** — CRUD completo (editar/eliminar contratos, pagos, hechos) + manejo offline.
- **Fase 4** — Notificaciones in-app en tiempo real + biometría + splash nativo.
- **Fase 5** — Screening con consentimiento + reportes de confianza agregados.
- **Fase 6** — Moderación, resolución de disputas, aviso FCRA, exportar/eliminar datos.

> Migraciones a correr en Supabase: `0008` → `0014`.

---

# FASE 7 — Cimientos legales y de cumplimiento (máxima prioridad)

Nada de screening real debe activarse sin esto. Aquí un error es literalmente fatal.

- **7.1** Aceptación de términos **versionada** + registro de consentimiento inmutable (quién aceptó qué versión y cuándo). 🔧
- **7.2** Verificación de **edad (18+)** y captura de jurisdicción (estado) del usuario. 🔧
- **7.3** **FCRA** — si algún día actuamos como CRA: permissible purpose gating, **adverse action notices** automáticos, procedimiento de reinvestigación (§611, 30 días). 🧑‍⚖️🔧
- **7.4** **Fair Housing Act** — anti-discriminación: sin criterios de clase protegida ni proxies, control de disparate impact, lenguaje neutral. 🧑‍⚖️🔧
- **7.5** **Leyes estatales de screening** (CA, NY, WA, IL…): criterios prohibidos, ban-the-box / historial criminal (guía HUD), avisos requeridos por estado. 🧑‍⚖️🔧
- **7.6** **Retención y borrado de datos** según ley + política documentada y aplicada por el sistema. 🔧
- **7.7** **Accesibilidad** WCAG 2.1 AA / ADA (obligatorio legalmente en muchos casos). 🔧
- **7.8** Disclaimers de responsabilidad, cláusula de **arbitraje**, ley aplicable, DMCA/takedown. 🧑‍⚖️

# FASE 8 — Identidad y verificación real (KYC)

Hoy solo subimos documentos; no se verifica nada de verdad.

- **8.1** Integración con proveedor de identidad (**Persona / Stripe Identity / Onfido**). 💳🔧
- **8.2** Verificación de **ID gubernamental** + **liveness/selfie**. 💳🔧
- **8.3** Verificación de **propiedad del landlord** (deed / registro catastral / tax record). 💳🔧
- **8.4** Verificación de **ingresos y empleo** (Plaid / Argyle / The Work Number). 💳🔧
- **8.5** Manejo **cifrado** de PII sensible (SSN/ITIN) — minimización y cifrado a nivel campo. 🔧
- **8.6** **Niveles de verificación**, re-verificación y expiración (badges por nivel). 🔧

# FASE 9 — Integridad de datos y evidencia (grado legal)

Para que un hecho o disputa sirva como registro confiable/defendible.

- **9.1** **Log de auditoría inmutable** append-only y tamper-evident de todo hecho, edición y disputa. 🔧
- **9.2** **Versionado de hechos**: el historial de ediciones se preserva, nunca se sobrescribe. 🔧
- **9.3** **Integridad de evidencia**: hash + timestamp + cadena de custodia de cada archivo. 🔧
- **9.4** **Legal hold** / preservación (bloquear borrado cuando hay disputa/litigio). 🔧
- **9.5** Exportación en formato **admisible** (con metadatos y certificación de integridad). 🔧

# FASE 10 — Seguridad de nivel producción

PII + legal = la seguridad no es opcional.

- **10.1** **MFA/2FA** (TOTP + SMS de respaldo). 🔧 (SMS 💳)
- **10.2** Verificación **obligatoria de email y teléfono** (SMS OTP). 🔧 (SMS 💳)
- **10.3** **Cifrado en reposo** de campos sensibles + gestión de secretos. 🔧
- **10.4** Gestión de **sesiones y dispositivos** (ver/cerrar sesiones activas). 🔧
- **10.5** **Rate limiting**, anti-abuso y protección contra bots. 🔧
- **10.6** **Logging de acceso** a datos sensibles (quién vio qué PII). 🔧
- **10.7** Procedimientos de **brecha** + backups y disaster recovery. 🧑‍⚖️🔧
- **10.8** Revisión **RLS de mínimo privilegio** + pen test / auditoría de seguridad. 🔧

# FASE 11 — Flujo de aplicación de alquiler (el caso central de screening)

Cerrar el ciclo tenant → landlord de forma real.

- **11.1** **Formulario de aplicación** completo (historial, empleo, referencias). 🔧
- **11.2** **Paquete de aplicación** (ID + ingresos + referencias + historial en uno). 🔧
- **11.3** **Co-aplicantes / garantes / cosigners**. 🔧
- **11.4** **Referencias verificadas** (landlords y empleadores previos). 🔧
- **11.5** **Dashboard de revisión** del landlord (comparar candidatos). 🔧
- **11.6** **Estado de aplicación** + notificaciones de cada etapa. 🔧
- **11.7** **Adverse action notice** generado automáticamente al rechazar (FCRA). 🧑‍⚖️🔧

# FASE 12 — Pagos reales y reporte de renta

Pasar de "registrar pagos" a moverlos y verificarlos.

- **12.1** **Procesamiento de pagos** de renta (Stripe / Plaid / Dwolla). 💳🔧
- **12.2** **Verificación automática** de pagos vía conexión bancaria (Plaid). 💳🔧
- **12.3** Recibos/facturas, **recordatorios**, autopay, **late fees**. 🔧
- **12.4** **Depósito en escrow** (custodia). 💳🧑‍⚖️
- **12.5** **Reporte de renta a burós** de crédito (rent reporting). 💳🧑‍⚖️
- **12.6** Reembolsos, disputas y **chargebacks**. 💳🔧

# FASE 13 — Score de confianza transparente y auditable

El score decide cosas → debe ser justo, explicable y defendible.

- **13.1** **Metodología documentada** y explicable (ficha pública del cálculo). 🔧
- **13.2** **Factores adversos** estilo FCRA + poder **contestar el score**. 🧑‍⚖️🔧
- **13.3** **Sin proxies de clase protegida** + auditoría de sesgo/disparate impact. 🧑‍⚖️🔧
- **13.4** **Historial y tendencia** del score con explicación de cada cambio. 🔧
- **13.5** **Gobernanza del modelo** (cambios versionados y auditados). 🔧

# FASE 14 — Gestión de propiedades y contratos

- **14.1** **Portafolios** / múltiples unidades por landlord. 🔧
- **14.2** **Documentos de contrato** + **firma electrónica** (ESIGN Act). 💳🔧
- **14.3** **Plantillas** de contrato por estado. 🧑‍⚖️🔧
- **14.4** **Inspecciones** move-in / move-out (fotos + checklist firmado). 🔧
- **14.5** **Solicitudes de mantenimiento** (tickets con estado). 🔧
- **14.6** **Múltiples inquilinos / roommates** por contrato. 🔧

# FASE 15 — Panel de administración y moderación

Hoy los `content_flags` se guardan pero nadie los revisa. Sin esto no se puede operar.

- **15.1** **Cola de moderación** (revisar flags, tomar acción). 🔧
- **15.2** Rol de **mediador humano** + herramientas de mediación de disputas. 🔧
- **15.3** **Gestión de usuarios** (suspender / verificar / banear). 🔧
- **15.4** **Auditoría** de acciones de admin. 🔧
- **15.5** **Analytics / métricas** del sistema. 🔧
- **15.6** Aplicación de **política de contenido**. 🧑‍⚖️🔧

# FASE 16 — Comunicación y notificaciones completas

- **16.1** **Chat en tiempo real** (adjuntos, recibos de lectura, typing). 🔧
- **16.2** **Email transaccional** (verificación, avisos, adverse action). 💳🔧
- **16.3** **Preferencias granulares** por tipo y canal (in-app / email). 🔧
- **16.4** **Soporte / helpdesk** (tickets de ayuda). 🔧
- **16.5** **Anuncios in-app** / centro de novedades. 🔧

# FASE 17 — Calidad, fiabilidad y observabilidad

Antes de que gente real dependa de esto.

- **17.1** **Tests automatizados** (unit + integration + e2e). 🔧
- **17.2** **Error tracking** (Sentry) + monitoreo / uptime. 💳🔧
- **17.3** **Validación y sanitización** de entrada en todos los formularios/RPC. 🔧
- **17.4** **Cola offline** de mutaciones + reintentos (no perder datos sin red). 🔧
- **17.5** **CI/CD con gates** (lint/test/build) + backups / DR. 🔧
- **17.6** **Performance** y pruebas de carga. 🔧

# FASE 18 — Onboarding, UX y accesibilidad final

- **18.1** **Onboarding guiado** por rol (tenant vs landlord). 🔧
- **18.2** **Medidor de completitud** de perfil / verificación. 🔧
- **18.3** **Estados vacíos y de error** consistentes en toda la app. 🔧
- **18.4** **Recuperación de cuenta** robusta. 🔧
- **18.5** Pulido visual final + i18n adicional (más idiomas si aplica). 🔧

# FASE 19 — Pre-lanzamiento (gate final antes de usuarios reales)

- **19.1** **QA end-to-end** de cada flujo, función por función. 🔧
- **19.2** **Revisión legal completa** por abogado (términos, privacidad, FCRA, Fair Housing, estatal). 🧑‍⚖️
- **19.3** **Auditoría de seguridad** externa / pen test. 💳
- **19.4** Publicación: **APK (Play Store) / PWA / App Store** + revisión de políticas de tienda. 💳
- **19.5** Plan de **soporte, incidentes y actualización** de términos.

---

## Orden recomendado

7 → 10 → 9 → 8 → 13 → 11 → 15 → 12 → 14 → 16 → 17 → 18 → 19

Racional: primero **cimientos legales (7)**, **seguridad (10)** e **integridad de datos (9)**
porque protegen todo lo demás; luego **identidad real (8)** y **score justo (13)** que son
insumo del **screening (11)**; después **operación (15)**, **dinero (12)** y **propiedades (14)**;
y al final **comunicación (16)**, **calidad (17)**, **UX (18)** y el **gate de lanzamiento (19)**.

> Las fases marcadas 🧑‍⚖️/💳 las construyo en la app (flujos, UI, esquema, integración),
> pero su **activación real** depende de tu cuenta con el proveedor y/o de una revisión
> de abogado. Lo iré señalando en cada entrega.
