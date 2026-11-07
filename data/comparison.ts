import type { Bilingual } from './portfolio.ts';

// Comparison of ways to run a company's IT. Describe how each option works,
// with no vendor named and no figure that is not Swirl Cloud's own; Swirl Cloud
// cells state only what the platform does today or mark the roadmap.
export const options = ['swirl', 'hyperscaler', 'kubernetes', 'saas'] as const;
type Option = (typeof options)[number];

export const optionNames: Record<Option, Bilingual> = {
  swirl: { fr: 'Swirl Cloud', en: 'Swirl Cloud' },
  hyperscaler: { fr: 'Hyperscaler', en: 'Hyperscaler' },
  kubernetes: {
    fr: 'Distribution Kubernetes à assembler',
    en: 'Do-it-yourself Kubernetes distribution',
  },
  saas: { fr: 'Abonnements SaaS séparés', en: 'Separate SaaS subscriptions' },
};

export const comparison = {
  title: {
    fr: 'Swirl Cloud comparé : hyperscaler, Kubernetes ou SaaS',
    en: 'Swirl Cloud Compared: Hyperscaler, Kubernetes or SaaS',
  },
  description: {
    fr: 'Swirl Cloud face à un hyperscaler, une distribution Kubernetes à assembler et des abonnements SaaS séparés : hébergement, facturation, exploitation, conformité, sortie.',
    en: 'Swirl Cloud against a hyperscaler, a do-it-yourself Kubernetes distribution and separate SaaS subscriptions: hosting, billing, operations, compliance and exit.',
  },
  heading: {
    fr: 'Quatre façons de faire tourner votre informatique.',
    en: 'Four ways to run your company’s IT.',
  },
  accent: { fr: 'Comparées sur des faits.', en: 'Compared on facts.' },
  lead: {
    fr: 'Un hyperscaler, une distribution Kubernetes que vous assemblez, une pile d’abonnements SaaS ou Swirl Cloud. Chaque critère décrit le fonctionnement de l’option, pas une promesse : choisissez celle qui convient à votre entreprise.',
    en: 'A hyperscaler, a Kubernetes distribution you assemble, a stack of SaaS subscriptions, or Swirl Cloud. Each criterion describes how the option works, not a promise: choose the one that fits your company.',
  },
  tags: ['Bare metal', 'Cloud', 'Kubernetes', 'SaaS'],
  criteria: [
    {
      name: { fr: 'Où cela fonctionne', en: 'Where it runs' },
      values: {
        swirl: {
          fr: 'Sur vos serveurs, loués ou dans vos locaux',
          en: 'On your servers, rented or on your premises',
        },
        hyperscaler: {
          fr: 'Dans les centres de données du fournisseur, aux régions qu’il propose',
          en: 'In the provider’s data centers, in the regions it offers',
        },
        kubernetes: { fr: 'Sur vos serveurs', en: 'On your servers' },
        saas: {
          fr: 'Sur l’infrastructure de chaque éditeur',
          en: 'On each vendor’s infrastructure',
        },
      },
    },
    {
      name: { fr: 'Facturation', en: 'Billing' },
      values: {
        swirl: {
          fr: 'Le prix mensuel fixe de vos serveurs, plus l’accompagnement choisi',
          en: 'The fixed monthly price of your servers, plus the support you choose',
        },
        hyperscaler: {
          fr: 'À l’usage : calcul, stockage, trafic et services gérés',
          en: 'By usage: compute, storage, traffic and managed services',
        },
        kubernetes: {
          fr: 'Le prix des serveurs, plus le temps de votre équipe',
          en: 'The servers’ price, plus your team’s time',
        },
        saas: {
          fr: 'Par utilisateur ou par formule, chez chaque éditeur',
          en: 'Per user or per plan, with each vendor',
        },
      },
    },
    {
      name: { fr: 'Ce qui est inclus', en: 'What is included' },
      values: {
        swirl: {
          fr: 'Livraison, authentification SSO, bases de données, supervision, sécurité, ERP et preuves de conformité, installés ensemble',
          en: 'Delivery, single sign-on, databases, monitoring, security, ERP and compliance evidence, installed together',
        },
        hyperscaler: {
          fr: 'Des briques à choisir, configurer et relier',
          en: 'Building blocks to select, configure and connect',
        },
        kubernetes: {
          fr: 'Un cluster ; livraison, identité, supervision et sauvegardes sont à ajouter',
          en: 'A cluster; delivery, identity, monitoring and backups are yours to add',
        },
        saas: {
          fr: 'Une fonction par abonnement',
          en: 'One function per subscription',
        },
      },
    },
    {
      name: { fr: 'Qui l’exploite', en: 'Who operates it' },
      values: {
        swirl: {
          fr: 'Vos équipes, avec le hub d’installation et une procédure par alerte, ou Swirl, sur des serveurs hébergés dans l’UE',
          en: 'Your team, with the setup hub and a runbook per alert, or Swirl, on servers hosted in the EU',
        },
        hyperscaler: {
          fr: 'Le fournisseur pour l’infrastructure, vous pour votre configuration',
          en: 'The provider for the infrastructure, you for your configuration',
        },
        kubernetes: {
          fr: 'Votre équipe plateforme',
          en: 'Your platform team',
        },
        saas: { fr: 'Chaque éditeur', en: 'Each vendor' },
      },
    },
    {
      name: { fr: 'Preuves de conformité', en: 'Compliance evidence' },
      values: {
        swirl: {
          fr: 'Contrôles rattachés à NIS2, ISO/IEC 27001, DORA et au RGPD, évalués en continu sur votre installation',
          en: 'Controls mapped to NIS2, ISO/IEC 27001, DORA and GDPR, evaluated continuously on your installation',
        },
        hyperscaler: {
          fr: 'Les certifications du fournisseur pour son périmètre ; celles de votre configuration sont à réunir',
          en: 'The provider’s certifications for its scope; evidence for your configuration is yours to gather',
        },
        kubernetes: { fr: 'À construire', en: 'Yours to build' },
        saas: {
          fr: 'Les rapports de chaque éditeur, à réunir un par un',
          en: 'Each vendor’s reports, gathered one by one',
        },
      },
    },
    {
      name: { fr: 'Juridiction', en: 'Jurisdiction' },
      values: {
        swirl: {
          fr: 'Celle de l’hébergeur et du pays que vous choisissez',
          en: 'That of the host and country you choose',
        },
        hyperscaler: {
          fr: 'Celle du fournisseur ; un fournisseur américain reste soumis au droit américain, comme le CLOUD Act',
          en: 'The provider’s; a US provider remains subject to US law, such as the CLOUD Act',
        },
        kubernetes: {
          fr: 'Celle de l’hébergeur que vous choisissez',
          en: 'That of the host you choose',
        },
        saas: { fr: 'Celle de chaque éditeur', en: 'Each vendor’s' },
      },
    },
    {
      name: { fr: 'Partir', en: 'Leaving' },
      values: {
        swirl: {
          fr: 'Formats standard : Git, images OCI, sauvegardes PostgreSQL et MongoDB ; procédure de sortie en préparation',
          en: 'Standard formats: Git, OCI images, PostgreSQL and MongoDB dumps; exit procedure on the roadmap',
        },
        hyperscaler: {
          fr: 'Les services gérés ont leurs propres API ; en partir implique de réécrire ces intégrations',
          en: 'Managed services have their own APIs; leaving means rewriting those integrations',
        },
        kubernetes: {
          fr: 'Composants standard, que vous maîtrisez',
          en: 'Standard components that you control',
        },
        saas: {
          fr: 'Un export par éditeur, au format qu’il propose',
          en: 'One export per vendor, in the format it offers',
        },
      },
    },
  ] satisfies { name: Bilingual; values: Record<Option, Bilingual> }[],
  choose: [
    {
      option: 'hyperscaler',
      text: {
        fr: 'Pour des régions dans le monde entier, une capacité qui varie fortement d’une heure à l’autre ou un service géré que Swirl Cloud n’inclut pas.',
        en: 'For regions worldwide, capacity that swings sharply from hour to hour, or a managed service that Swirl Cloud does not include.',
      },
    },
    {
      option: 'kubernetes',
      text: {
        fr: 'Si vous avez une équipe plateforme et des besoins que des composants choisis un à un servent mieux.',
        en: 'If you have a platform team and needs that hand-picked components serve better.',
      },
    },
    {
      option: 'saas',
      text: {
        fr: 'Pour un outil précis, utilisé tout de suite, sans rien héberger.',
        en: 'For one specific tool, used right away, with nothing to host.',
      },
    },
    {
      option: 'swirl',
      text: {
        fr: 'Pour héberger vos applications et vos outils d’entreprise chez vous, à coût fixe, avec les preuves que demandent vos auditeurs et vos clients.',
        en: 'To host your applications and company tools yourself, at a fixed cost, with the evidence your auditors and customers ask for.',
      },
    },
  ] satisfies { option: Option; text: Bilingual }[],
};
