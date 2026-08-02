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
      heading: "Disclaimer of warranties",
      body: [
        "Tenant Trust is provided \"as is\" and \"as available,\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
        "We do not verify the accuracy of every fact and do not warrant that the service will be uninterrupted, secure, or error-free. You use the information at your own risk and are responsible for your own decisions.",
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "To the fullest extent permitted by law, Tenant Trust and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill, arising from your use of the service.",
        "Our total liability for any claim relating to the service will not exceed the greater of the amount you paid us in the 12 months before the claim or US$100.",
      ],
    },
    {
      heading: "Indemnification",
      body: [
        "You agree to indemnify and hold harmless Tenant Trust from any claims, damages, or expenses (including reasonable attorneys' fees) arising out of your content, your use of the service, or your violation of these terms or of any law, including the FCRA and Fair Housing laws.",
      ],
    },
    {
      heading: "Dispute resolution & arbitration",
      body: [
        "Please read this section carefully — it affects your legal rights. You and Tenant Trust agree to first try to resolve any dispute informally by contacting us.",
        "If we cannot resolve it, you and Tenant Trust agree that any dispute will be resolved by binding individual arbitration, not in court, except that either party may bring claims in small-claims court. You and Tenant Trust waive the right to a jury trial and to participate in a class action. You may opt out of this arbitration agreement within 30 days of first accepting these terms by contacting us.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the United States and of the state in which Tenant Trust is established, without regard to conflict-of-laws rules. Where arbitration does not apply, disputes will be heard in the courts of that jurisdiction.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms. When we make material changes we will raise the version and ask you to accept the new version before continuing to use the app. Your continued use after acceptance means you agree to the updated terms.",
      ],
    },
    {
      heading: "Copyright (DMCA)",
      body: [
        "We respect intellectual property. If you believe content on Tenant Trust infringes your copyright, send a notice with the required details (see our DMCA policy) and we will act on valid notices, including removing the content and, where appropriate, terminating repeat infringers.",
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
      heading: "Descargo de garantías",
      body: [
        "Tenant Trust se ofrece \"tal cual\" y \"según disponibilidad\", sin garantías de ningún tipo, expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin particular y no infracción.",
        "No verificamos la exactitud de cada hecho ni garantizamos que el servicio sea ininterrumpido, seguro o libre de errores. Usas la información bajo tu propio riesgo y eres responsable de tus decisiones.",
      ],
    },
    {
      heading: "Limitación de responsabilidad",
      body: [
        "En la máxima medida permitida por la ley, Tenant Trust y sus afiliados no serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por pérdida de ganancias, datos o reputación, derivados de tu uso del servicio.",
        "Nuestra responsabilidad total por cualquier reclamo relacionado con el servicio no excederá el mayor entre el monto que nos pagaste en los 12 meses previos al reclamo o US$100.",
      ],
    },
    {
      heading: "Indemnización",
      body: [
        "Aceptas indemnizar y eximir de responsabilidad a Tenant Trust por cualquier reclamo, daño o gasto (incluidos honorarios razonables de abogados) que surja de tu contenido, tu uso del servicio o tu incumplimiento de estos términos o de cualquier ley, incluidas la FCRA y las leyes de Vivienda Justa.",
      ],
    },
    {
      heading: "Resolución de disputas y arbitraje",
      body: [
        "Lee esta sección con atención — afecta tus derechos legales. Tú y Tenant Trust aceptan primero intentar resolver cualquier disputa de forma informal contactándonos.",
        "Si no podemos resolverla, tú y Tenant Trust aceptan que cualquier disputa se resolverá mediante arbitraje individual vinculante, no en un tribunal, salvo que cualquiera de las partes pueda presentar reclamos en un tribunal de reclamos menores. Tú y Tenant Trust renuncian al derecho a un juicio con jurado y a participar en una acción de clase. Puedes optar por salir de este acuerdo de arbitraje dentro de los 30 días de aceptar estos términos por primera vez, contactándonos.",
      ],
    },
    {
      heading: "Ley aplicable",
      body: [
        "Estos términos se rigen por las leyes de los Estados Unidos y del estado en el que Tenant Trust esté establecido, sin considerar reglas de conflicto de leyes. Cuando el arbitraje no aplique, las disputas se verán en los tribunales de esa jurisdicción.",
      ],
    },
    {
      heading: "Cambios a estos términos",
      body: [
        "Podemos actualizar estos términos. Cuando hagamos cambios importantes, subiremos la versión y te pediremos aceptar la nueva versión antes de seguir usando la app. Tu uso continuado tras la aceptación significa que aceptas los términos actualizados.",
      ],
    },
    {
      heading: "Derechos de autor (DMCA)",
      body: [
        "Respetamos la propiedad intelectual. Si crees que un contenido en Tenant Trust infringe tus derechos de autor, envía un aviso con los detalles requeridos (ver nuestra política DMCA) y actuaremos ante avisos válidos, incluyendo eliminar el contenido y, cuando corresponda, terminar a infractores reincidentes.",
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
