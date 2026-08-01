"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "FCRA notice",
  updated: "Last updated · February 2026",
  intro:
    "Important: Tenant Trust is NOT a consumer reporting agency, and the information here is NOT a consumer report or a \"credit\" or \"screening\" report as defined by the U.S. Fair Credit Reporting Act (FCRA). Read how you may and may not use it.",
  sections: [
    {
      heading: "Not a consumer report",
      body: [
        "Tenant Trust facilitates a voluntary, bilateral record between people who have a direct rental relationship. It does not assemble or evaluate consumer information for the purpose of furnishing consumer reports to third parties.",
      ],
    },
    {
      heading: "Prohibited uses",
      body: [
        "You may NOT use Tenant Trust information as a factor in establishing a person's eligibility for credit, insurance, employment, housing, or any other purpose covered by the FCRA.",
        "Do not deny housing, employment, or credit based on a Tenant Trust profile or report.",
      ],
    },
    {
      heading: "Consent-based sharing",
      body: [
        "A person's full report is private and only shared when they approve a specific request. Trust is built from facts each party recorded about a real, direct relationship — not purchased data.",
      ],
    },
    {
      heading: "Accuracy & disputes",
      body: [
        "Facts can be disputed by the person they concern, and disputes are shown alongside the fact. Nothing here is a verdict or an official background check.",
      ],
    },
    {
      heading: "Your responsibility",
      body: [
        "By using Tenant Trust you agree to comply with the FCRA and all applicable local, state and federal laws governing tenant screening and the use of personal information.",
      ],
    },
  ] as LegalSection[],
};

const es = {
  title: "Aviso FCRA",
  updated: "Última actualización · febrero 2026",
  intro:
    "Importante: Tenant Trust NO es una agencia de informes del consumidor, y la información aquí NO es un informe del consumidor ni un informe de \"crédito\" o \"screening\" según la Ley de Informe Justo de Crédito de EE. UU. (FCRA). Lee cómo puedes y cómo no puedes usarla.",
  sections: [
    {
      heading: "No es un informe del consumidor",
      body: [
        "Tenant Trust facilita un registro voluntario y bilateral entre personas con una relación de alquiler directa. No recopila ni evalúa información del consumidor con el fin de entregar informes a terceros.",
      ],
    },
    {
      heading: "Usos prohibidos",
      body: [
        "NO puedes usar la información de Tenant Trust como factor para determinar la elegibilidad de una persona para crédito, seguros, empleo, vivienda ni ningún otro propósito cubierto por la FCRA.",
        "No niegues vivienda, empleo o crédito con base en un perfil o reporte de Tenant Trust.",
      ],
    },
    {
      heading: "Compartir con consentimiento",
      body: [
        "El reporte completo de una persona es privado y solo se comparte cuando aprueba una solicitud específica. La confianza se construye con hechos que cada parte registró sobre una relación real y directa — no con datos comprados.",
      ],
    },
    {
      heading: "Exactitud y disputas",
      body: [
        "Los hechos pueden ser disputados por la persona a quien conciernen, y las disputas se muestran junto al hecho. Nada aquí es un veredicto ni una verificación de antecedentes oficial.",
      ],
    },
    {
      heading: "Tu responsabilidad",
      body: [
        "Al usar Tenant Trust aceptas cumplir con la FCRA y todas las leyes locales, estatales y federales aplicables sobre screening de inquilinos y uso de información personal.",
      ],
    },
  ] as LegalSection[],
};

export default function FcraScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
