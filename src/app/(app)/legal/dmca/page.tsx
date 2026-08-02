"use client";

import { useLocale } from "@/lib/i18n";
import { LegalDoc, type LegalSection } from "../legal-doc";

const en = {
  title: "Copyright / DMCA policy",
  updated: "Last updated · February 2026",
  intro:
    "Tenant Trust respects intellectual property rights and expects users to do the same. This policy explains how to report content you believe infringes your copyright, and how to respond if your content was removed.",
  sections: [
    {
      heading: "Filing a takedown notice",
      body: [
        "If you own a copyright (or are authorized to act for the owner) and believe content on Tenant Trust infringes it, send a written notice from Help & support that includes all of the following:",
        "(1) Your physical or electronic signature; (2) identification of the copyrighted work claimed to be infringed; (3) identification of the material you say is infringing and enough detail to locate it; (4) your contact information; (5) a statement that you have a good-faith belief the use is not authorized by the owner, its agent, or the law; and (6) a statement, under penalty of perjury, that the information is accurate and you are authorized to act.",
      ],
    },
    {
      heading: "What we do",
      body: [
        "We act on valid notices expeditiously, which may include removing or disabling access to the material and notifying the person who posted it.",
      ],
    },
    {
      heading: "Counter-notice",
      body: [
        "If your content was removed and you believe it was a mistake or misidentification, you may send a counter-notice with your signature, identification of the removed material and its location, a statement under penalty of perjury that you have a good-faith belief it was removed by mistake, and your contact information and consent to jurisdiction. We may restore the material as permitted by law.",
      ],
    },
    {
      heading: "Repeat infringers",
      body: [
        "We will, in appropriate circumstances, disable or terminate the accounts of users who are repeat infringers.",
      ],
    },
    {
      heading: "Misrepresentation",
      body: [
        "Knowingly making a material misrepresentation in a notice or counter-notice can lead to liability for damages under the law. When in doubt, consult an attorney.",
      ],
    },
  ] as LegalSection[],
};

const es = {
  title: "Política de derechos de autor / DMCA",
  updated: "Última actualización · febrero 2026",
  intro:
    "Tenant Trust respeta los derechos de propiedad intelectual y espera que los usuarios hagan lo mismo. Esta política explica cómo reportar contenido que creas que infringe tus derechos de autor, y cómo responder si tu contenido fue eliminado.",
  sections: [
    {
      heading: "Presentar un aviso de retiro",
      body: [
        "Si posees un derecho de autor (o estás autorizado a actuar por el titular) y crees que un contenido en Tenant Trust lo infringe, envía un aviso por escrito desde Ayuda y soporte que incluya todo lo siguiente:",
        "(1) Tu firma física o electrónica; (2) identificación de la obra protegida presuntamente infringida; (3) identificación del material que consideras infractor y detalle suficiente para ubicarlo; (4) tu información de contacto; (5) una declaración de que tienes la creencia de buena fe de que el uso no está autorizado por el titular, su agente o la ley; y (6) una declaración, bajo pena de perjurio, de que la información es exacta y estás autorizado a actuar.",
      ],
    },
    {
      heading: "Qué hacemos",
      body: [
        "Actuamos ante avisos válidos con prontitud, lo que puede incluir eliminar o deshabilitar el acceso al material y notificar a quien lo publicó.",
      ],
    },
    {
      heading: "Contra-aviso",
      body: [
        "Si tu contenido fue eliminado y crees que fue un error o una identificación equivocada, puedes enviar un contra-aviso con tu firma, la identificación del material eliminado y su ubicación, una declaración bajo pena de perjurio de que tienes la creencia de buena fe de que se eliminó por error, y tu información de contacto y consentimiento a la jurisdicción. Podemos restaurar el material según lo permita la ley.",
      ],
    },
    {
      heading: "Infractores reincidentes",
      body: [
        "En circunstancias apropiadas, deshabilitaremos o terminaremos las cuentas de usuarios que sean infractores reincidentes.",
      ],
    },
    {
      heading: "Falsedad",
      body: [
        "Hacer a sabiendas una declaración falsa material en un aviso o contra-aviso puede generar responsabilidad por daños según la ley. Ante la duda, consulta a un abogado.",
      ],
    },
  ] as LegalSection[],
};

export default function DmcaScreen() {
  const { locale } = useLocale();
  const t = locale === "es" ? es : en;
  return <LegalDoc title={t.title} updated={t.updated} intro={t.intro} sections={t.sections} />;
}
