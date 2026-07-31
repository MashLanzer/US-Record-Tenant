import type { Dict } from "./index";

/** Strings shared across many screens (nav, common actions). */
export const common: Dict<{
  appName: string;
  tagline: string;
  tabs: { home: string; search: string; records: string; messages: string; profile: string };
  actions: {
    continue: string;
    cancel: string;
    back: string;
    save: string;
    next: string;
    done: string;
    seeAll: string;
    viewDetails: string;
    retry: string;
    getStarted: string;
  };
  status: {
    verified: string;
    pending: string;
    inDispute: string;
    premium: string;
  };
  roles: { tenant: string; landlord: string };
}> = {
  en: {
    appName: "Tenant Trust",
    tagline: "Trust, verified.",
    tabs: {
      home: "Home",
      search: "Search",
      records: "Records",
      messages: "Messages",
      profile: "Profile",
    },
    actions: {
      continue: "Continue",
      cancel: "Cancel",
      back: "Back",
      save: "Save",
      next: "Next",
      done: "Done",
      seeAll: "See all",
      viewDetails: "View details",
      retry: "Try again",
      getStarted: "Get started",
    },
    status: {
      verified: "Verified",
      pending: "Pending",
      inDispute: "In dispute",
      premium: "Premium",
    },
    roles: { tenant: "Tenant", landlord: "Landlord" },
  },
  es: {
    appName: "Tenant Trust",
    tagline: "La confianza, verificada.",
    tabs: {
      home: "Inicio",
      search: "Buscar",
      records: "Historial",
      messages: "Mensajes",
      profile: "Perfil",
    },
    actions: {
      continue: "Continuar",
      cancel: "Cancelar",
      back: "Atrás",
      save: "Guardar",
      next: "Siguiente",
      done: "Listo",
      seeAll: "Ver todo",
      viewDetails: "Ver detalles",
      retry: "Reintentar",
      getStarted: "Empezar",
    },
    status: {
      verified: "Verificado",
      pending: "Pendiente",
      inDispute: "En disputa",
      premium: "Premium",
    },
    roles: { tenant: "Inquilino", landlord: "Propietario" },
  },
};
