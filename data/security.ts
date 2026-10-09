import type { Bilingual } from './portfolio.ts';

// Swirl Cloud security and compliance page. The control catalog itself lives
// in compliance-controls.ts; this file holds the page copy. State evidence the
// platform produces, never a certification or a compliance outcome.
type Card = { title: Bilingual; text: Bilingual };

export const security = {
  title: {
    fr: 'Sécurité et conformité de Swirl Cloud : NIS2, ISO 27001, DORA',
    en: 'Swirl Cloud Security and Compliance: NIS2, ISO 27001, DORA',
  },
  description: {
    fr: 'Les contrôles de Swirl Cloud rattachés à NIS2, ISO/IEC 27001, DORA, au RGPD et aux benchmarks CIS, leurs preuves pour vos audits et notre politique de divulgation.',
    en: 'Swirl Cloud controls mapped to NIS2, ISO/IEC 27001, DORA, GDPR and the CIS benchmarks, the evidence they give your audits, and our disclosure policy.',
  },
  heading: {
    fr: 'Une sécurité que vous pouvez prouver.',
    en: 'Security you can prove.',
  },
  accent: {
    fr: 'Les preuves viennent de la plateforme en fonctionnement.',
    en: 'Evidence from the running platform.',
  },
  lead: {
    fr: 'Swirl Cloud rattache ses contrôles à NIS2, ISO/IEC 27001, DORA, au RGPD et aux benchmarks CIS, évalue les contrôles techniques en continu à partir de la plateforme elle-même et rassemble les preuves pour vos auditeurs. Ces preuves soutiennent un audit ; elles ne valent pas certification.',
    en: 'Swirl Cloud maps its controls to NIS2, ISO/IEC 27001, DORA, GDPR and the CIS benchmarks, evaluates the technical ones continuously from the platform itself and gathers the evidence for your auditors. The evidence supports an audit; it does not certify compliance.',
  },
  tags: ['NIS2', 'ISO/IEC 27001', 'DORA', 'GDPR · RGPD', 'CIS'],
  evidence: [
    {
      title: { fr: 'Cataloguer', en: 'Catalog' },
      text: {
        fr: 'Chaque contrôle indique son objectif, les exigences qu’il couvre, ses vérifications automatiques et les documents qu’un auditeur demandera.',
        en: 'Each control states its objective, the requirements it supports, its automated checks and the documents an auditor will ask for.',
      },
    },
    {
      title: { fr: 'Évaluer', en: 'Evaluate' },
      text: {
        fr: 'Prometheus évalue les vérifications toutes les 15 secondes : un contrôle passe quand sa preuve existe et qu’aucune vérification n’échoue.',
        en: 'Prometheus evaluates the checks every 15 seconds: a control passes when its evidence exists and no check fails.',
      },
    },
    {
      title: { fr: 'Surveiller', en: 'Watch' },
      text: {
        fr: 'Un tableau de bord suit chaque référentiel, et une alerte se déclenche quand un contrôle se dégrade pendant 30 minutes.',
        en: 'A dashboard follows each framework, and an alert fires when a control degrades for 30 minutes.',
      },
    },
    {
      title: { fr: 'Prouver', en: 'Prove' },
      text: {
        fr: 'Un rapport par référentiel et un dossier de preuves haché et signé avec votre clé, que vos auditeurs vérifient hors ligne.',
        en: 'A report per framework and an evidence pack, hashed and signed with your key, that your auditors verify offline.',
      },
    },
  ] satisfies Card[],
  reports: [
    {
      title: { fr: 'Revue des accès', en: 'Access review' },
      text: {
        fr: 'Les utilisateurs de Keycloak et de GitLab avec leurs rôles et leur dernière connexion, les administrateurs de Kubernetes et d’Argo CD, les comptes de secours et une feuille de validation à signer.',
        en: 'Keycloak and GitLab users with their roles and last sign-in, Kubernetes and Argo CD administrators, break-glass accounts, and a keep-or-revoke sheet to sign.',
      },
    },
    {
      title: {
        fr: 'Registre des traitements RGPD',
        en: 'GDPR records of processing',
      },
      text: {
        fr: 'Un projet de registre (article 30) établi à partir des applications, de leurs données, de leurs sous-traitants et de leurs sauvegardes.',
        en: 'A draft Article 30 record built from the applications, their data, their processors and their backups.',
      },
    },
    {
      title: {
        fr: 'Incidents et échéances NIS2',
        en: 'Incidents and NIS2 deadlines',
      },
      text: {
        fr: 'Une chronologie des alertes, changements et connexions, avec les échéances NIS2 (24 heures, 72 heures, un mois) et RGPD (72 heures) et les projets de rapports.',
        en: 'A timeline of alerts, changes and sign-ins, with the NIS2 (24 hours, 72 hours, one month) and GDPR (72 hours) deadlines and draft reports.',
      },
    },
    {
      title: { fr: 'Délais de correction', en: 'Remediation deadlines' },
      text: {
        fr: 'Chaque vulnérabilité d’une image en fonctionnement est suivie depuis sa découverte : 15 jours pour une critique, 30 pour une haute.',
        en: 'Every vulnerability in a running image is tracked from first sighting: 15 days for a critical one, 30 for a high one.',
      },
    },
    {
      title: { fr: 'Âge des identifiants', en: 'Credential age' },
      text: {
        fr: 'Chaque secret de Vault avec sa version, sa dernière écriture et son âge face à la limite, sans jamais révéler sa valeur.',
        en: 'Every Vault secret with its version, last write and age against the limit, without ever revealing its value.',
      },
    },
    {
      title: { fr: 'Rapport mensuel', en: 'Monthly report' },
      text: {
        fr: 'La part du temps où chaque contrôle a passé, la disponibilité et les coûts du mois, conservés 13 mois.',
        en: 'The share of time each control passed, plus the month’s availability and costs, kept for 13 months.',
      },
    },
  ] satisfies Card[],
  pentest: {
    fr: 'Aucun test d’intrusion externe n’a encore été mené. Il est prévu sur une installation de référence avant la première installation client, puis à chaque version majeure.',
    en: 'No external penetration test has been performed yet. One is planned on a reference installation before the first customer installation, then for each major release.',
  },
  disclosure: {
    fr: 'Vous pensez avoir trouvé une vulnérabilité dans Swirl Cloud ou dans ce site ? Écrivez à contact@swirlit.dev en indiquant l’adresse ou le composant concerné, les étapes pour la reproduire et l’impact constaté. N’accédez pas à des données et ne les modifiez pas au-delà de ce qui démontre le problème, évitez de perturber le service, et laissez-nous le temps de corriger avant toute publication.',
    en: 'Think you have found a vulnerability in Swirl Cloud or this website? Write to contact@swirlit.dev with the affected address or component, the steps to reproduce it and the impact you observed. Do not access or change data beyond what demonstrates the issue, avoid disrupting the service, and give us time to fix it before publishing.',
  },
  faq: [
    {
      question: {
        fr: 'Swirl Cloud est-il certifié ?',
        en: 'Is Swirl Cloud certified?',
      },
      answer: {
        fr: 'Non. Une certification ISO/IEC 27001 porte sur une organisation et son périmètre, pas sur un logiciel. Swirl Cloud fournit les preuves techniques de vos propres audits.',
        en: 'No. An ISO/IEC 27001 certification covers an organization and its scope, not a piece of software. Swirl Cloud provides the technical evidence for your own audits.',
      },
    },
    {
      question: {
        fr: 'Swirl Cloud nous rend-il conformes à NIS2 ou à DORA ?',
        en: 'Does Swirl Cloud make us NIS2 or DORA compliant?',
      },
      answer: {
        fr: 'Il couvre et prouve les mesures techniques de la plateforme. La gouvernance, l’analyse de risques, la formation et les accords avec vos fournisseurs restent de votre ressort ; la plateforme liste les documents qu’un auditeur vous demandera.',
        en: 'It covers and proves the platform’s technical measures. Governance, risk assessment, training and supplier agreements remain your responsibility; the platform lists the documents an auditor will ask you for.',
      },
    },
    {
      question: {
        fr: 'Les preuves quittent-elles nos serveurs ?',
        en: 'Does the evidence leave our servers?',
      },
      answer: {
        fr: 'Non. Les vérifications, les rapports et le dossier de preuves sont produits sur votre installation ; vous choisissez ce que vous remettez à vos auditeurs.',
        en: 'No. Checks, reports and the evidence pack are produced on your installation; you choose what to hand to your auditors.',
      },
    },
  ],
};
