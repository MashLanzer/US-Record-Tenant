"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "Fair Housing policy",
  updated: "Last updated · February 2026",
  intro:
    "Tenant Trust supports equal housing opportunity. The federal Fair Housing Act prohibits discrimination in housing based on protected classes. This policy explains what that means on our platform and what we require of every user.",
  sections: [
    {
      heading: "Protected classes",
      body: [
        "It is illegal to make a housing decision — including recording facts, screening, or issuing an adverse action — based on a person's race, color, national origin, religion, sex (including sexual orientation and gender identity), familial status (having children), or disability.",
        "Many states and cities protect additional classes such as age, marital status, source of income (e.g. housing vouchers), and military status. You are responsible for the rules in your jurisdiction.",
      ],
    },
    {
      heading: "Facts must be about conduct, not identity",
      body: [
        "Every fact on Tenant Trust must describe verifiable conduct — payments, damage, contract terms, communication — never a person's identity or membership in a protected class. Language that references a protected class is flagged and must be corrected before it can be recorded.",
      ],
    },
    {
      heading: "No discriminatory screening",
      body: [
        "Trust reports contain only conduct and financial signals. You may not use Tenant Trust to select for or against any protected class, and you must apply the same criteria to every applicant.",
      ],
    },
    {
      heading: "Adverse actions",
      body: [
        "When you take an adverse action, you must certify it is not based on any protected class. Reasons must be tied to conduct or finances, and the same standards must apply to everyone.",
      ],
    },
    {
      heading: "Enforcement",
      body: [
        "Content or behavior that violates this policy may be removed and accounts may be suspended. Discrimination in housing may also be reported to HUD or your state fair housing agency.",
      ],
    },
    {
      heading: "Equal Housing Opportunity",
      body: [
        "Tenant Trust operates in support of, and commits to, the letter and spirit of U.S. policy for the achievement of equal housing opportunity.",
      ],
    },
  ] as LegalSection[],
};

const es = {
  title: "Política de Vivienda Justa",
  updated: "Última actualización · febrero 2026",
  intro:
    "Tenant Trust apoya la igualdad de oportunidades de vivienda. La Ley Federal de Vivienda Justa prohíbe la discriminación en vivienda por clases protegidas. Esta política explica qué significa eso en nuestra plataforma y qué exigimos de cada usuario.",
  sections: [
    {
      heading: "Clases protegidas",
      body: [
        "Es ilegal tomar una decisión de vivienda — incluyendo registrar hechos, hacer screening o emitir una acción adversa — con base en la raza, color, origen nacional, religión, sexo (incluida la orientación sexual e identidad de género), estatus familiar (tener hijos) o discapacidad de una persona.",
        "Muchos estados y ciudades protegen clases adicionales como edad, estado civil, fuente de ingresos (p. ej. vales de vivienda) y estatus militar. Eres responsable de las reglas de tu jurisdicción.",
      ],
    },
    {
      heading: "Los hechos son sobre conducta, no identidad",
      body: [
        "Cada hecho en Tenant Trust debe describir conducta verificable — pagos, daños, términos del contrato, comunicación — nunca la identidad de una persona ni su pertenencia a una clase protegida. El lenguaje que refiere a una clase protegida se marca y debe corregirse antes de poder registrarse.",
      ],
    },
    {
      heading: "Sin screening discriminatorio",
      body: [
        "Los reportes de confianza contienen solo señales de conducta y financieras. No puedes usar Tenant Trust para seleccionar a favor o en contra de ninguna clase protegida, y debes aplicar los mismos criterios a cada solicitante.",
      ],
    },
    {
      heading: "Acciones adversas",
      body: [
        "Al tomar una acción adversa, debes certificar que no se basa en ninguna clase protegida. Las razones deben estar ligadas a conducta o finanzas, y los mismos estándares deben aplicar a todos.",
      ],
    },
    {
      heading: "Cumplimiento",
      body: [
        "El contenido o comportamiento que viole esta política puede eliminarse y las cuentas pueden suspenderse. La discriminación en vivienda también puede reportarse a HUD o a la agencia de vivienda justa de tu estado.",
      ],
    },
    {
      heading: "Igualdad de Oportunidad de Vivienda",
      body: [
        "Tenant Trust opera en apoyo de, y se compromete con, la letra y el espíritu de la política de EE. UU. para lograr la igualdad de oportunidades de vivienda.",
      ],
    },
  ] as LegalSection[],
};

export default function FairHousingScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
