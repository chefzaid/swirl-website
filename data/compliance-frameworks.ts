import type { Bilingual, Lang } from './portfolio.ts';

// Frameworks the Swirl Cloud controls map to, and how their references read.
export type Framework = 'nis2' | 'iso27001' | 'dora' | 'gdpr' | 'cis';

export const frameworkNames: Record<Framework, Bilingual> = {
  nis2: { fr: 'NIS2', en: 'NIS2' },
  iso27001: { fr: 'ISO 27001', en: 'ISO 27001' },
  dora: { fr: 'DORA', en: 'DORA' },
  gdpr: { fr: 'RGPD', en: 'GDPR' },
  cis: { fr: 'CIS', en: 'CIS' },
};

// Descriptive CIS references; numbered ones read the same in both languages.
const cisLabels: Record<string, Bilingual> = {
  'Ubuntu: host-based firewall': {
    fr: 'Ubuntu : pare-feu du serveur',
    en: 'Ubuntu: host-based firewall',
  },
  'Ubuntu: filesystem integrity checking': {
    fr: 'Ubuntu : intégrité des fichiers',
    en: 'Ubuntu: filesystem integrity checking',
  },
  'Ubuntu: software updates': {
    fr: 'Ubuntu : mises à jour logicielles',
    en: 'Ubuntu: software updates',
  },
  'Ubuntu: benchmark audit': {
    fr: 'Ubuntu : audit du benchmark',
    en: 'Ubuntu: benchmark audit',
  },
  'Kubernetes benchmark': {
    fr: 'benchmark Kubernetes',
    en: 'Kubernetes benchmark',
  },
};
export const referenceLabel = (
  framework: Framework,
  ref: string,
  lang: Lang,
) => (framework === 'cis' ? (cisLabels[ref]?.[lang] ?? ref) : ref);
