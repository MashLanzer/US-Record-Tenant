/**
 * Fair Housing content guard.
 *
 * The federal Fair Housing Act prohibits housing decisions based on protected
 * classes: race, color, national origin, religion, sex (incl. sexual
 * orientation & gender identity per HUD), familial status, and disability.
 * Many states/localities add more (age, marital status, source of income,
 * military status, etc.).
 *
 * Facts on Tenant Trust must be about *conduct* (payments, damage, contract
 * terms), never about *identity*. This module scans free text for language
 * that may reference a protected class and warns the user before they submit.
 * It is a soft safeguard (warn + require acknowledgment), not a perfect filter,
 * and can false-positive — that is intentional: it prompts people to reconsider
 * wording, it does not silently block or judge.
 */

type Category = {
  key: string;
  en: string;
  es: string;
  // Word-ish patterns; matched case-insensitively with loose boundaries.
  terms: string[];
};

const CATEGORIES: Category[] = [
  {
    key: "race",
    en: "Race / color / ethnicity",
    es: "Raza / color / etnia",
    terms: [
      "race", "racial", "black", "white person", "brown", "skin color", "colored",
      "african", "asian", "latino", "latina", "hispanic", "arab", "indian", "native",
      "raza", "negro", "negra", "moreno", "morena", "blanco", "blanca", "color de piel",
      "africano", "asiático", "árabe", "indígena",
    ],
  },
  {
    key: "national_origin",
    en: "National origin / immigration",
    es: "Origen nacional / migración",
    terms: [
      "immigrant", "immigration", "foreigner", "illegal alien", "undocumented", "citizenship",
      "accent", "where are you from", "your country",
      "inmigrante", "extranjero", "ilegal", "indocumentado", "ciudadanía", "acento", "tu país",
    ],
  },
  {
    key: "religion",
    en: "Religion",
    es: "Religión",
    terms: [
      "religion", "religious", "muslim", "islam", "christian", "catholic", "jewish", "jew",
      "hindu", "buddhist", "church", "mosque", "synagogue",
      "religión", "musulmán", "cristiano", "católico", "judío", "iglesia", "mezquita",
    ],
  },
  {
    key: "sex",
    en: "Sex / gender / sexual orientation",
    es: "Sexo / género / orientación sexual",
    terms: [
      "gay", "lesbian", "homosexual", "transgender", "trans woman", "trans man", "queer",
      "her gender", "his gender", "sexual orientation", "single woman", "single man",
      "gei", "lesbiana", "transgénero", "orientación sexual", "mujer sola", "hombre solo",
    ],
  },
  {
    key: "familial",
    en: "Familial status / children",
    es: "Estatus familiar / niños",
    terms: [
      "children", "kids", "no kids", "child", "baby", "babies", "pregnant", "pregnancy",
      "single mother", "single father", "family with", "too many kids",
      "niños", "hijos", "sin hijos", "embarazada", "embarazo", "madre soltera", "padre soltero",
    ],
  },
  {
    key: "disability",
    en: "Disability / medical",
    es: "Discapacidad / médico",
    terms: [
      "disabled", "disability", "wheelchair", "handicap", "mental illness", "service animal",
      "emotional support animal", "medical condition", "hiv",
      "discapacitado", "discapacidad", "silla de ruedas", "enfermedad mental", "animal de servicio",
      "condición médica",
    ],
  },
  {
    key: "age",
    en: "Age",
    es: "Edad",
    terms: ["too old", "too young", "elderly", "senior citizen", "your age", "demasiado viejo", "demasiado joven", "anciano", "tu edad"],
  },
  {
    key: "marital",
    en: "Marital status",
    es: "Estado civil",
    terms: ["married", "unmarried", "divorced", "widow", "widower", "casado", "soltero", "divorciado", "viuda", "viudo"],
  },
  {
    key: "income_source",
    en: "Source of income",
    es: "Fuente de ingresos",
    terms: ["section 8", "housing voucher", "welfare", "food stamps", "government assistance", "vale de vivienda", "asistencia del gobierno", "cupones"],
  },
  {
    key: "military",
    en: "Military / veteran status",
    es: "Estatus militar / veterano",
    terms: ["veteran", "military status", "active duty", "veterano", "estatus militar"],
  },
];

export type FairHousingScan = {
  flagged: boolean;
  categories: { key: string; en: string; es: string }[];
  terms: string[];
};

/** Scan text for language that may reference a protected class. */
export function scanProtectedClass(text: string): FairHousingScan {
  const hay = ` ${text.toLowerCase()} `;
  const categories: FairHousingScan["categories"] = [];
  const terms: string[] = [];
  for (const cat of CATEGORIES) {
    let hit = false;
    for (const t of cat.terms) {
      // Loose boundary: preceded/followed by a non-letter (handles punctuation).
      const re = new RegExp(`(^|[^a-záéíóúñ])${escapeRegex(t.toLowerCase())}([^a-záéíóúñ]|$)`, "i");
      if (re.test(hay)) {
        hit = true;
        terms.push(t);
      }
    }
    if (hit) categories.push({ key: cat.key, en: cat.en, es: cat.es });
  }
  return { flagged: categories.length > 0, categories, terms };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Federal protected classes, for display in notices and education. */
export const PROTECTED_CLASSES = {
  en: ["Race", "Color", "National origin", "Religion", "Sex (incl. gender identity & sexual orientation)", "Familial status", "Disability"],
  es: ["Raza", "Color", "Origen nacional", "Religión", "Sexo (incl. identidad de género y orientación sexual)", "Estatus familiar", "Discapacidad"],
};
