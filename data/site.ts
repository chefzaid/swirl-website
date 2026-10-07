import {
  projects,
  services,
  type Bilingual,
  type Lang,
  type Project,
  type Service,
} from './portfolio.ts';

// Keep this origin aligned with the deployed domain. Change it once a custom
// domain is connected; metadata, alternates and the sitemap share this value.
export const siteConfig = {
  origin: 'https://swirlit.dev',
  name: 'Swirl',
  organizationName: 'Swirl IT',
  email: 'contact@swirlit.dev',
  ceo: 'Zaïd Chefchaouni',
  linkedin: 'https://www.linkedin.com/in/chefzaid/',
  // Platform Odoo serving the "Chat with us" widget (Live Chat channel ID).
  odooOrigin: 'https://odoo.swirlit.dev',
  chatChannelId: 1,
};

const slugs: Record<Project['id'], Bilingual> = {
  cacib: {
    fr: 'credit-agricole-cib-calcul-financier',
    en: 'credit-agricole-cib-financial-computing',
  },
  enedis: { fr: 'enedis-compteurs-connectes', en: 'enedis-connected-meters' },
  bpce: {
    fr: 'bpce-natixis-parcours-assurance',
    en: 'bpce-natixis-insurance-journeys',
  },
  sg: {
    fr: 'societe-generale-donnees-financieres',
    en: 'societe-generale-financial-data',
  },
  allianz: {
    fr: 'allianz-trade-assurance-credit',
    en: 'allianz-trade-credit-insurance',
  },
  bouygues: {
    fr: 'bouygues-construction-suivi-chantiers',
    en: 'bouygues-construction-site-tracking',
  },
  cdc: {
    fr: 'caisse-des-depots-banque-en-ligne',
    en: 'caisse-des-depots-online-banking',
  },
  idemia: {
    fr: 'idemia-envoi-codes-securises',
    en: 'idemia-secure-pin-delivery',
  },
  ingenico: {
    fr: 'ingenico-supervision-paiements',
    en: 'ingenico-payment-monitoring',
  },
  engie: {
    fr: 'engie-portail-electricite-gaz',
    en: 'engie-electricity-gas-portal',
  },
};
// Service landing pages sit at the root so their URLs carry the search terms.
const serviceSlugs: Record<Service['id'], Bilingual> = {
  web: {
    fr: 'developpement-applications-sur-mesure',
    en: 'custom-software-development',
  },
  embedded: { fr: 'logiciel-embarque-iot', en: 'embedded-software-iot' },
  'cloud-ai': {
    fr: 'cloud-prive-souverain-ia',
    en: 'sovereign-private-cloud-ai',
  },
};
export const homePath = (lang: Lang) => (lang === 'fr' ? '/' : '/en/');
export const privacyPath = (lang: Lang) =>
  lang === 'fr' ? '/confidentialite/' : '/en/privacy/';
export const projectsPath = (lang: Lang) =>
  lang === 'fr' ? '/projets/' : '/en/projects/';
export const projectSlug = (id: Project['id'], lang: Lang) => slugs[id][lang];
export const projectPath = (id: Project['id'], lang: Lang) =>
  `${projectsPath(lang)}${projectSlug(id, lang)}/`;
export const serviceSlug = (id: Service['id'], lang: Lang) =>
  serviceSlugs[id][lang];
export const servicePath = (id: Service['id'], lang: Lang) =>
  `${homePath(lang)}${serviceSlug(id, lang)}/`;

export type PageRef =
  | { kind: 'home' | 'privacy' | 'projects' }
  | { kind: 'service'; id: Service['id'] }
  | { kind: 'project'; id: Project['id'] };
const pairs: (Bilingual & { page: PageRef })[] = [
  { fr: '/', en: '/en/', page: { kind: 'home' } },
  ...services.map((s) => ({
    fr: servicePath(s.id, 'fr'),
    en: servicePath(s.id, 'en'),
    page: { kind: 'service', id: s.id } as const,
  })),
  {
    fr: projectsPath('fr'),
    en: projectsPath('en'),
    page: { kind: 'projects' },
  },
  ...projects.map((p) => ({
    fr: projectPath(p.id, 'fr'),
    en: projectPath(p.id, 'en'),
    page: { kind: 'project', id: p.id } as const,
  })),
  { fr: privacyPath('fr'), en: privacyPath('en'), page: { kind: 'privacy' } },
];
export const documentRoutes = pairs.flatMap(({ page, ...alternates }) =>
  (['fr', 'en'] as const).map((lang) => ({
    path: alternates[lang],
    lang,
    alternates,
    page,
  })),
);
export type DocumentRoute = (typeof documentRoutes)[number];
export const absoluteUrl = (path: string) =>
  new URL(path, siteConfig.origin).href;
// Build-time social preview for a document route, e.g. /og/en-projects.png.
export const socialImagePath = (path: string) =>
  `/og/${path.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'fr'}.png`;
export const socialImageSize = { width: 1200, height: 630 };
