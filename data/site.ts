import {
  projects,
  type Bilingual,
  type Lang,
  type Project,
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
export const homePath = (lang: Lang) => (lang === 'fr' ? '/' : '/en/');
export const projectSlug = (id: Project['id'], lang: Lang) => slugs[id][lang];
export const projectPath = (id: Project['id'], lang: Lang) =>
  `${lang === 'fr' ? '/projets/' : '/en/projects/'}${projectSlug(id, lang)}/`;

const pairs: Bilingual[] = [
  { fr: '/', en: '/en/' },
  { fr: '/confidentialite/', en: '/en/privacy/' },
  ...projects.map((p) => ({
    fr: projectPath(p.id, 'fr'),
    en: projectPath(p.id, 'en'),
  })),
];
export const documentRoutes = pairs.flatMap((alternates) =>
  (['fr', 'en'] as const).map((lang) => ({
    path: alternates[lang],
    lang,
    alternates,
  })),
);
export const absoluteUrl = (path: string) =>
  new URL(path, siteConfig.origin).href;
