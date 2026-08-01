"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "Privacy Policy",
  updated: "Last updated · February 2026",
  intro:
    "Your privacy is core to Tenant Trust. This policy explains what we collect, why, and the control you have. In short: you own your record and choose who sees it.",
  sections: [
    {
      heading: "What we collect",
      body: [
        "Account details (name, email, role), the rental facts and payments you or your counterparty record, ratings, disputes, and — if you choose to verify — identity documents you upload.",
        "We also record who views your trust profile, so you have a transparent access log.",
      ],
    },
    {
      heading: "How we use it",
      body: [
        "To build your bilateral rental record, compute your trust score from verified history, notify you of activity, and keep the platform secure. We do not sell your personal data.",
      ],
    },
    {
      heading: "Who can see your record",
      body: [
        "By default, only you and the counterparties on your leases can see facts about you. Sharing your trust profile with a prospective landlord or tenant is always your choice, and every access is logged in your dossier.",
      ],
    },
    {
      heading: "Security",
      body: [
        "Data is protected with row-level security so each person can only reach records they are party to. Uploaded documents are stored privately and served through short-lived links.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can view, edit, and export your data, and close your account at any time. Facts already shared with a counterparty may remain in their record, but disputed facts always show your side.",
      ],
    },
    {
      heading: "Contact",
      body: ["Privacy questions or requests? Reach us from Help & support inside the app."],
    },
  ] as LegalSection[],
};

const es = {
  title: "Política de privacidad",
  updated: "Última actualización · febrero 2026",
  intro:
    "Tu privacidad es esencial en Tenant Trust. Esta política explica qué recopilamos, por qué y qué control tienes. En resumen: tu historial es tuyo y tú eliges quién lo ve.",
  sections: [
    {
      heading: "Qué recopilamos",
      body: [
        "Datos de cuenta (nombre, correo, rol), los hechos de alquiler y pagos que tú o tu contraparte registren, calificaciones, disputas y — si eliges verificarte — los documentos de identidad que subes.",
        "También registramos quién ve tu perfil de confianza, para que tengas un registro de acceso transparente.",
      ],
    },
    {
      heading: "Cómo lo usamos",
      body: [
        "Para construir tu historial de alquiler bilateral, calcular tu puntaje de confianza a partir de historial verificado, notificarte actividad y mantener la plataforma segura. No vendemos tus datos personales.",
      ],
    },
    {
      heading: "Quién puede ver tu historial",
      body: [
        "Por defecto, solo tú y las contrapartes de tus contratos pueden ver hechos sobre ti. Compartir tu perfil de confianza con un posible propietario o inquilino siempre es tu decisión, y cada acceso queda registrado en tu expediente.",
      ],
    },
    {
      heading: "Seguridad",
      body: [
        "Los datos se protegen con seguridad a nivel de fila para que cada persona solo acceda a los registros de los que es parte. Los documentos subidos se almacenan de forma privada y se sirven mediante enlaces de corta duración.",
      ],
    },
    {
      heading: "Tus derechos",
      body: [
        "Puedes ver, editar y exportar tus datos, y cerrar tu cuenta cuando quieras. Los hechos ya compartidos con una contraparte pueden permanecer en su historial, pero los hechos en disputa siempre muestran tu versión.",
      ],
    },
    {
      heading: "Contacto",
      body: ["¿Dudas o solicitudes de privacidad? Escríbenos desde Ayuda y soporte dentro de la app."],
    },
  ] as LegalSection[],
};

export default function PrivacyScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
