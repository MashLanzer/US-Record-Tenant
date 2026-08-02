"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "Accessibility",
  updated: "Last updated · February 2026",
  intro:
    "Tenant Trust is committed to digital accessibility for everyone, including people with disabilities. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and to meet our obligations under the Americans with Disabilities Act (ADA).",
  sections: [
    {
      heading: "What we do",
      body: [
        "We build with semantic structure, keyboard support, visible focus, sufficient color contrast, labels for controls and images, and support for screen readers.",
        "The app respects your system 'reduce motion' and language settings, and works in both light and dark themes.",
      ],
    },
    {
      heading: "Ongoing effort",
      body: [
        "Accessibility is continuous. We test as we build and fix issues as we find them. Some areas may not yet fully conform; we are actively improving them.",
      ],
    },
    {
      heading: "Need an accommodation?",
      body: [
        "If you have trouble using any part of Tenant Trust, or need information in a different format, contact us from Help & support in the app. We will work with you to provide the information or complete the task you need.",
      ],
    },
    {
      heading: "Feedback",
      body: [
        "We welcome your feedback on the accessibility of Tenant Trust. Tell us where we fall short so we can fix it.",
      ],
    },
  ] as LegalSection[],
};

const es = {
  title: "Accesibilidad",
  updated: "Última actualización · febrero 2026",
  intro:
    "Tenant Trust se compromete con la accesibilidad digital para todas las personas, incluidas las personas con discapacidad. Buscamos cumplir las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1 nivel AA y nuestras obligaciones bajo la Ley de Estadounidenses con Discapacidades (ADA).",
  sections: [
    {
      heading: "Qué hacemos",
      body: [
        "Construimos con estructura semántica, soporte de teclado, foco visible, contraste de color suficiente, etiquetas para controles e imágenes, y soporte para lectores de pantalla.",
        "La app respeta tus ajustes de 'reducir movimiento' e idioma del sistema, y funciona en temas claro y oscuro.",
      ],
    },
    {
      heading: "Esfuerzo continuo",
      body: [
        "La accesibilidad es continua. Probamos mientras construimos y corregimos problemas al encontrarlos. Algunas áreas podrían no cumplir del todo aún; las estamos mejorando activamente.",
      ],
    },
    {
      heading: "¿Necesitas una adaptación?",
      body: [
        "Si tienes dificultad para usar cualquier parte de Tenant Trust, o necesitas información en otro formato, contáctanos desde Ayuda y soporte en la app. Trabajaremos contigo para darte la información o completar la tarea que necesitas.",
      ],
    },
    {
      heading: "Comentarios",
      body: [
        "Agradecemos tus comentarios sobre la accesibilidad de Tenant Trust. Dinos dónde fallamos para poder corregirlo.",
      ],
    },
  ] as LegalSection[],
};

export default function AccessibilityScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
