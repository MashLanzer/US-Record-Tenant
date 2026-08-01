/**
 * State-specific tenant-screening rules (Fase 7.5).
 *
 * Tenant-screening law varies widely by state and city. This module surfaces
 * the well-known statewide protections for the user's jurisdiction so landlords
 * and applicants know what applies. It is NOT legal advice and is not
 * exhaustive — city/county rules often add more, and laws change. Every entry
 * must be verified by an attorney and kept current.
 *
 * Sourced from commonly-cited statewide statutes as of early 2026. Treat as a
 * drafting baseline for attorney review, not authority.
 */

export type StateRule = { en: string[]; es: string[] };

// Applies everywhere in the U.S., on top of any state entry below.
export const FEDERAL_BASELINE: StateRule = {
  en: [
    "Fair Housing Act: no decisions based on race, color, national origin, religion, sex (incl. orientation & gender identity), familial status, or disability.",
    "FCRA: if you deny or condition based on a report, you must give an adverse action notice and honor the right to dispute.",
    "HUD guidance: blanket criminal-history bans can violate Fair Housing — use an individualized assessment.",
  ],
  es: [
    "Ley de Vivienda Justa: sin decisiones por raza, color, origen nacional, religión, sexo (incl. orientación e identidad de género), estatus familiar o discapacidad.",
    "FCRA: si niegas o condicionas con base en un reporte, debes dar un aviso de acción adversa y respetar el derecho a disputar.",
    "Guía de HUD: los vetos generales por antecedentes penales pueden violar Vivienda Justa — usa una evaluación individualizada.",
  ],
};

// Curated statewide protections for states with notable screening laws.
export const STATE_LAWS: Record<string, StateRule> = {
  CA: {
    en: [
      "Source of income is a protected class (FEHA) — you cannot refuse Section 8 / housing vouchers.",
      "Application screening fee is capped (adjusted yearly) and you must give an itemized receipt and the report if requested.",
      "Criminal history must be assessed individually where local Fair Chance ordinances apply (e.g., Oakland, SF, LA County).",
    ],
    es: [
      "La fuente de ingresos es clase protegida (FEHA) — no puedes rechazar Section 8 / vales de vivienda.",
      "La tarifa de screening tiene tope (ajustado cada año) y debes dar recibo detallado y el reporte si se solicita.",
      "Los antecedentes penales deben evaluarse individualmente donde aplican ordenanzas Fair Chance (Oakland, SF, LA County).",
    ],
  },
  NY: {
    en: [
      "Source of income is protected statewide — vouchers must be accepted.",
      "Application fees for background/credit checks are capped at $20, and you must provide a copy of the report.",
      "You may not automatically reject based on past eviction filings or rental court records.",
    ],
    es: [
      "La fuente de ingresos está protegida en todo el estado — deben aceptarse los vales.",
      "Las tarifas por verificación de antecedentes/crédito tienen tope de $20 y debes dar copia del reporte.",
      "No puedes rechazar automáticamente por desalojos previos o registros de corte de alquiler.",
    ],
  },
  WA: {
    en: [
      "You must state screening criteria up front and give a written adverse action notice with the reason for denial.",
      "Applicants may use a portable/reusable screening report; fees are limited to actual cost.",
      "Seattle adds 'Fair Chance' (limits on criminal history) and 'first-in-time' rules.",
    ],
    es: [
      "Debes declarar los criterios de screening por adelantado y dar un aviso escrito de acción adversa con la razón del rechazo.",
      "Los solicitantes pueden usar un reporte de screening portable/reutilizable; las tarifas se limitan al costo real.",
      "Seattle añade 'Fair Chance' (límites a antecedentes penales) y reglas de 'primero en llegar'.",
    ],
  },
  OR: {
    en: [
      "You must publish written screening criteria and evaluate applicants against them in order.",
      "Application fee rules apply; unused fees may need to be refunded.",
      "Source of income is protected; criminal history generally requires an individualized assessment.",
    ],
    es: [
      "Debes publicar criterios de screening por escrito y evaluar a los solicitantes en orden contra ellos.",
      "Aplican reglas de tarifa de solicitud; las no usadas pueden requerir reembolso.",
      "La fuente de ingresos está protegida; los antecedentes penales suelen requerir evaluación individualizada.",
    ],
  },
  CO: {
    en: [
      "Application fees must reflect actual cost, with a written notice/receipt.",
      "You must accept a portable tenant screening report if provided.",
      "Limits on how far back you may consider criminal (5 yrs) and rental/credit history; source of income is protected.",
    ],
    es: [
      "Las tarifas de solicitud deben reflejar el costo real, con aviso/recibo por escrito.",
      "Debes aceptar un reporte de screening portable si se proporciona.",
      "Límites sobre cuánto atrás puedes considerar antecedentes penales (5 años) e historial de alquiler/crédito; la fuente de ingresos está protegida.",
    ],
  },
  NJ: {
    en: [
      "Fair Chance in Housing Act: you may not ask about most criminal history until after a conditional offer, then only an individualized review.",
      "Source of income is protected — vouchers must be accepted.",
    ],
    es: [
      "Ley Fair Chance en Vivienda: no puedes preguntar por la mayoría de antecedentes penales hasta después de una oferta condicional, y luego solo revisión individualizada.",
      "La fuente de ingresos está protegida — deben aceptarse los vales.",
    ],
  },
  IL: {
    en: [
      "Cook County protects source of income and requires an individualized 'Just Housing' criminal-history assessment after other criteria.",
      "No statewide application-fee cap — disclose fees clearly.",
    ],
    es: [
      "El condado de Cook protege la fuente de ingresos y exige una evaluación individualizada de antecedentes 'Just Housing' después de otros criterios.",
      "No hay tope estatal de tarifa de solicitud — divulga las tarifas claramente.",
    ],
  },
  MA: {
    en: [
      "Landlords generally may not charge application/screening fees.",
      "Source of income (incl. Section 8) is protected.",
    ],
    es: [
      "Los arrendadores por lo general no pueden cobrar tarifas de solicitud/screening.",
      "La fuente de ingresos (incl. Section 8) está protegida.",
    ],
  },
  DC: {
    en: [
      "Source of income is protected.",
      "Fair Criminal Record Screening: criminal history may only be considered after a conditional offer, with an individualized review.",
    ],
    es: [
      "La fuente de ingresos está protegida.",
      "Screening Justo de Antecedentes: los antecedentes penales solo pueden considerarse tras una oferta condicional, con revisión individualizada.",
    ],
  },
  CT: {
    en: ["Source of income (incl. vouchers) is protected statewide."],
    es: ["La fuente de ingresos (incl. vales) está protegida en todo el estado."],
  },
  MN: {
    en: [
      "Some cities (e.g., Minneapolis, St. Paul) protect source of income and limit criminal/eviction screening lookbacks.",
    ],
    es: [
      "Algunas ciudades (p. ej., Minneapolis, St. Paul) protegen la fuente de ingresos y limitan el alcance del screening de antecedentes/desalojos.",
    ],
  },
  MD: {
    en: ["Source of income is protected statewide (HOME Act) — vouchers must be considered."],
    es: ["La fuente de ingresos está protegida en todo el estado (HOME Act) — deben considerarse los vales."],
  },
  VA: {
    en: ["Source of income is protected statewide; application fees are capped by statute."],
    es: ["La fuente de ingresos está protegida en todo el estado; las tarifas de solicitud tienen tope legal."],
  },
};

/** True when we have a curated entry for this state. */
export function hasStateRules(code: string | null | undefined): boolean {
  return !!code && code in STATE_LAWS;
}

export function getStateRule(code: string | null | undefined): StateRule | null {
  if (!code) return null;
  return STATE_LAWS[code] ?? null;
}
