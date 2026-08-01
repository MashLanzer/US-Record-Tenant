"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "Terms of Service",
  updated: "Last updated · February 2026",
  intro:
    "Welcome to Tenant Trust. By creating an account you agree to these terms. Tenant Trust is a platform for landlords and tenants to build a factual, verifiable rental record. It is not a consumer reporting agency and does not make rental decisions for you.",
  sections: [
    {
      heading: "What Tenant Trust is",
      body: [
        "Tenant Trust lets the two parties of a lease record facts, confirm each other, exchange ratings, and dispute anything they disagree with. Records are built bilaterally — both sides participate.",
        "We are not a blacklist and do not sell tenant scores to landlords. Facts are owned by the people they concern, who can always respond.",
      ],
    },
    {
      heading: "Your responsibilities",
      body: [
        "You agree to record only truthful facts and to attach honest evidence. Deliberately false reports may lead to removal of the record and suspension of your account.",
        "You are responsible for keeping your login credentials secure and for all activity under your account.",
      ],
    },
    {
      heading: "Facts, disputes and fairness",
      body: [
        "When you record a fact about a counterparty, they are notified and may dispute it. Disputed facts are clearly marked and show both sides. Nothing on Tenant Trust is a legal verdict.",
      ],
    },
    {
      heading: "Identity verification",
      body: [
        "Some features require identity verification. You agree that the information and documents you submit are genuine and belong to you.",
      ],
    },
    {
      heading: "Termination",
      body: [
        "You may close your account at any time. We may suspend accounts that violate these terms or applicable law. Facts already shared bilaterally may remain part of the other party's record.",
      ],
    },
    {
      heading: "Contact",
      body: ["Questions about these terms? Reach us any time from Help & support inside the app."],
    },
  ] as LegalSection[],
};

const es = {
  title: "Términos del servicio",
  updated: "Última actualización · febrero 2026",
  intro:
    "Bienvenido a Tenant Trust. Al crear una cuenta aceptas estos términos. Tenant Trust es una plataforma para que propietarios e inquilinos construyan un historial de alquiler basado en hechos y verificable. No es una agencia de informes crediticios y no toma decisiones de alquiler por ti.",
  sections: [
    {
      heading: "Qué es Tenant Trust",
      body: [
        "Tenant Trust permite que las dos partes de un contrato registren hechos, se confirmen mutuamente, intercambien calificaciones y disputen aquello en lo que no estén de acuerdo. Los historiales se construyen de forma bilateral — ambas partes participan.",
        "No somos una lista negra y no vendemos puntajes de inquilinos a propietarios. Los hechos pertenecen a las personas a quienes conciernen, quienes siempre pueden responder.",
      ],
    },
    {
      heading: "Tus responsabilidades",
      body: [
        "Aceptas registrar únicamente hechos veraces y adjuntar evidencia honesta. Los reportes deliberadamente falsos pueden llevar a la eliminación del registro y a la suspensión de tu cuenta.",
        "Eres responsable de mantener seguras tus credenciales y de toda actividad realizada con tu cuenta.",
      ],
    },
    {
      heading: "Hechos, disputas y justicia",
      body: [
        "Cuando registras un hecho sobre una contraparte, se le notifica y puede disputarlo. Los hechos en disputa se marcan claramente y muestran ambas versiones. Nada en Tenant Trust es un veredicto legal.",
      ],
    },
    {
      heading: "Verificación de identidad",
      body: [
        "Algunas funciones requieren verificación de identidad. Aceptas que la información y los documentos que envías son genuinos y te pertenecen.",
      ],
    },
    {
      heading: "Terminación",
      body: [
        "Puedes cerrar tu cuenta en cualquier momento. Podemos suspender cuentas que violen estos términos o la ley aplicable. Los hechos ya compartidos de forma bilateral pueden permanecer como parte del historial de la otra parte.",
      ],
    },
    {
      heading: "Contacto",
      body: ["¿Dudas sobre estos términos? Escríbenos cuando quieras desde Ayuda y soporte dentro de la app."],
    },
  ] as LegalSection[],
};

export default function TermsScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
