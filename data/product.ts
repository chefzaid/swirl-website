import type { Bilingual } from './portfolio.ts';

// Swirl Cloud product page. State only what the platform already does (its
// features guide in the platform repository); anything still being built goes
// in `roadmap`. Describe capabilities, not the technologies or products behind
// them; each layer's `stack` is the one place on the page that names them.
type Card = { title: Bilingual; text: Bilingual };
type Layer = Card & { stack: string[] };

export const product = {
  name: 'Swirl Cloud',
  // Search title after the "Swirl | " brand prefix, and meta description.
  title: {
    fr: 'Swirl Cloud, cloud privé d’entreprise sur serveurs dédiés',
    en: 'Swirl Cloud, a Private Company Cloud on Bare Metal',
  },
  description: {
    fr: 'Swirl Cloud installe une plateforme d’entreprise complète sur vos serveurs : déploiement, SSO, données, supervision, sécurité, ERP et preuves de conformité.',
    en: 'Swirl Cloud installs a complete company platform on your own servers: delivery, single sign-on, data, monitoring, security, ERP and compliance evidence.',
  },
  heading: {
    fr: 'Le cloud de votre entreprise,',
    en: 'Your company cloud,',
  },
  accent: {
    fr: 'sur des serveurs que vous maîtrisez.',
    en: 'on servers you control.',
  },
  lead: {
    fr: 'Swirl Cloud installe sur des serveurs dédiés, loués ou à vous, ce qu’une entreprise assemble sinon chez un hyperscaler et plusieurs éditeurs SaaS : déploiement des applications, authentification SSO, bases de données, supervision, sécurité et un ERP. Les preuves de conformité sont produites par la plateforme en fonctionnement, et l’infrastructure coûte le prix mensuel fixe de vos serveurs, sans facturation à l’usage.',
    en: 'Swirl Cloud installs what a company otherwise assembles from a hyperscaler and several SaaS vendors on rented or owned bare-metal servers: application delivery, single sign-on, databases, monitoring, security and an ERP. Compliance evidence comes from the running platform, and the infrastructure costs the fixed monthly price of your servers, not usage billing.',
  },
  // Homepage presentation, before the client logos.
  teaser: {
    fr: 'Déploiement des applications, authentification SSO, données, supervision, sécurité, ERP et preuves de conformité, installés ensemble sur vos serveurs, à coût fixe.',
    en: 'Application delivery, single sign-on, data, monitoring, security, ERP and compliance evidence, installed together on your servers at a fixed cost.',
  },
  tags: [
    { fr: 'Serveurs dédiés', en: 'Dedicated servers' },
    { fr: 'Déploiement continu', en: 'Continuous delivery' },
    { fr: 'SSO et secrets', en: 'SSO and secrets' },
    { fr: 'ERP intégré', en: 'Built-in ERP' },
  ] satisfies Bilingual[],
  audienceIntro: {
    fr: 'Les entreprises qui ont besoin d’une plateforme, d’une facture prévisible et de preuves d’audit, sans équipe plateforme dédiée.',
    en: 'Companies that need a platform, a predictable bill and audit evidence, without a platform team of their own.',
  },
  audiences: [
    {
      title: {
        fr: 'Les entreprises sans équipe plateforme',
        en: 'Companies without a platform team',
      },
      text: {
        fr: 'Assembler une plateforme soi-même suppose des ingénieurs plateforme en interne. Le hub d’installation de Swirl Cloud installe la plateforme, ajoute des serveurs et vérifie le résultat, et chaque alerte renvoie à sa procédure.',
        en: 'Assembling a platform yourself takes in-house platform engineers. The Swirl Cloud setup hub installs the platform, adds servers and verifies the result, and every alert links to its runbook.',
      },
    },
    {
      title: {
        fr: 'Les entités soumises à NIS2',
        en: 'Organizations under NIS2',
      },
      text: {
        fr: 'Des contrôles rattachés à l’article 21 de NIS2, évalués en continu, et des rapports d’incident préparés avec leurs échéances : alerte précoce sous 24 heures, notification sous 72 heures, rapport final sous un mois.',
        en: 'Controls mapped to NIS2 Article 21 and evaluated continuously, and incident reports drafted with their deadlines: early warning within 24 hours, notification within 72 hours, final report within a month.',
      },
    },
    {
      title: {
        fr: 'Les entités financières et leurs prestataires TIC',
        en: 'Financial entities and their ICT providers',
      },
      text: {
        fr: 'Des contrôles rattachés à DORA et un dossier de preuves signé que les auditeurs vérifient hors ligne, pour vos propres audits comme pour ceux de vos clients.',
        en: 'Controls mapped to DORA and a signed evidence pack that auditors verify offline, for your own audits and for your clients’ supplier reviews.',
      },
    },
    {
      title: {
        fr: 'Les fournisseurs face aux questionnaires de sécurité',
        en: 'Suppliers answering security questionnaires',
      },
      text: {
        fr: 'Répondez à partir de faits : la liste des services externes et des données qu’ils reçoivent, les revues d’accès, les délais de correction des vulnérabilités et la disponibilité mensuelle.',
        en: 'Answer from facts: the list of external services and the data each receives, access reviews, vulnerability deadlines and monthly availability.',
      },
    },
  ] satisfies Card[],
  layersIntro: {
    fr: 'Une installation pilotée depuis un dépôt de code et organisée en couches. Tout ce qui suit est disponible aujourd’hui.',
    en: 'One installation, managed from a code repository and organized in layers. Everything below is available today.',
  },
  layers: [
    {
      title: { fr: 'Serveurs et stockage', en: 'Servers and storage' },
      text: {
        fr: 'Un ou plusieurs serveurs, loués ou à vous, reliés par un réseau privé. Stockage répliqué avec volumes chiffrés au choix, et une archive de restauration quotidienne, chiffrable et copiable hors site.',
        en: 'One or more servers, rented or owned, joined by a private network. Replicated storage with optional encrypted volumes, and a daily recovery archive that can be encrypted and copied off site.',
      },
      stack: ['Ubuntu', 'Kubernetes', 'Longhorn', 'restic'],
    },
    {
      title: { fr: 'Accès et identité', en: 'Access and identity' },
      text: {
        fr: 'Une authentification SSO, en français et en anglais, pour tous les outils d’administration. Les droits d’administrateur sont accordés pour 1 à 24 heures, approuvés, enregistrés et retirés automatiquement.',
        en: 'Single sign-on, in English and French, for every administration tool. Administrator rights are granted for 1 to 24 hours, approved, recorded and removed automatically.',
      },
      stack: ['Keycloak', 'OAuth2 Proxy', 'Traefik', 'Cloudflare'],
    },
    {
      title: { fr: 'Livraison des applications', en: 'Application delivery' },
      text: {
        fr: 'Hébergement du code, pipelines d’intégration continue et registre d’images ; les déploiements partent du dépôt vers les environnements int, uat et prod. Chaque application rejoint la plateforme par un contrat déclaratif et un premier déploiement vérifié.',
        en: 'Code hosting, CI pipelines and a container registry; deployments go from the repository to int, uat and prod environments. Each application joins through a declarative contract and a verified first deployment.',
      },
      stack: ['GitLab', 'Argo CD'],
    },
    {
      title: { fr: 'Données et secrets', en: 'Data and secrets' },
      text: {
        fr: 'Bases de données relationnelles et documentaires, cache et flux d’événements, avec des identifiants distincts par environnement. Un coffre-fort conserve les secrets et les transmet aux applications.',
        en: 'Relational and document databases, caching and event streaming, with separate credentials per environment. A secure store holds the secrets and delivers them to applications.',
      },
      stack: [
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'Kafka',
        'Vault',
        'External Secrets',
      ],
    },
    {
      title: { fr: 'Supervision et coûts', en: 'Monitoring and costs' },
      text: {
        fr: 'Métriques, journaux centralisés et tableaux de bord par application. Chaque adresse publique est sondée face à un objectif de disponibilité de 99,5 %, et le coût mensuel de chaque serveur est réparti par environnement et par application.',
        en: 'Metrics, centralized logs and dashboards per application. Every public address is probed against a 99.5% availability objective, and each server’s monthly cost is shown per environment and application.',
      },
      stack: [
        'Prometheus',
        'Alertmanager',
        'Grafana',
        'Elasticsearch',
        'Kibana',
        'Fluent Bit',
      ],
    },
    {
      title: { fr: 'Sécurité opérationnelle', en: 'Security operations' },
      text: {
        fr: 'Analyse des vulnérabilités et des configurations, qualité du code, protection contre les intrusions sur les serveurs exposés, politiques d’admission, et alertes sur les connexions suspectes, les changements de droits et les accès aux secrets.',
        en: 'Vulnerability and configuration scanning, code quality analysis, intrusion prevention on exposed servers, admission policies, and alerts on suspicious logins, permission changes and secret access.',
      },
      stack: [
        'Trivy',
        'SonarQube',
        'CrowdSec',
        'Fail2ban',
        'Lynis',
        'AppArmor',
      ],
    },
    {
      title: { fr: 'Preuves de conformité', en: 'Compliance evidence' },
      text: {
        fr: 'Des contrôles rattachés à NIS2, ISO/IEC 27001, DORA, au RGPD et aux benchmarks CIS, évalués en continu, un dossier de preuves signé, des revues d’accès, un registre des traitements RGPD et un rapport mensuel conservé 13 mois.',
        en: 'Controls mapped to NIS2, ISO/IEC 27001, DORA, GDPR and the CIS benchmarks, evaluated continuously, a signed evidence pack, access reviews, GDPR records of processing and a monthly report kept for 13 months.',
      },
      stack: ['Prometheus', 'Grafana', 'CycloneDX', 'OpenVEX'],
    },
    {
      title: { fr: 'Applications métier', en: 'Business applications' },
      text: {
        fr: 'Un ERP avec authentification SSO, dont le CRM et le chat en direct qui reçoivent les demandes de ce site.',
        en: 'An ERP with single sign-on, including the CRM and live chat that handle this website’s inquiries.',
      },
      stack: ['Odoo'],
    },
  ] satisfies Layer[],
  stackHeading: {
    fr: 'Les technologies actuelles',
    en: 'The current technology stack',
  },
  stackIntro: {
    fr: 'Swirl Cloud utilise actuellement les technologies suivantes, couche par couche. Cette pile n’est pas figée : elle peut être adaptée et évoluer selon vos besoins.',
    en: 'Swirl Cloud currently uses the technologies below, layer by layer. The stack is not fixed: it can be adapted and evolve with your needs.',
  },
  deliveryIntro: {
    fr: 'Un premier serveur demande au moins 64 Go de mémoire et 500 Go NVMe.',
    en: 'A first server needs at least 64 GB of memory and 500 GB NVMe.',
  },
  delivery: [
    {
      title: { fr: 'Installée chez vous', en: 'Installed on your servers' },
      text: {
        fr: 'Sur des serveurs loués ou dans vos locaux, par vos équipes ou avec Swirl. Le hub d’installation, en français ou en anglais, vérifie le serveur, ne demande que l’essentiel, installe et contrôle le résultat.',
        en: 'On rented servers or on your premises, by your team or with Swirl. The setup hub, in English or French, checks the server, asks only what is needed, installs and verifies the result.',
      },
    },
    {
      title: { fr: 'Exploitée par vos équipes', en: 'Run by your team' },
      text: {
        fr: 'Une procédure pour chaque alerte, un rapport mensuel de disponibilité, de coûts et de conformité, et un suivi de capacité qui indique quoi ajouter et quand.',
        en: 'A runbook for every alert, a monthly report on availability, costs and compliance, and capacity planning that says what to add and when.',
      },
    },
    {
      title: { fr: 'Opérée par Swirl', en: 'Operated by Swirl' },
      text: {
        fr: 'Swirl installe et exploite votre plateforme sur des serveurs hébergés dans l’UE.',
        en: 'Swirl installs and runs your platform on servers hosted in the EU.',
      },
    },
  ] satisfies Card[],
  roadmapIntro: {
    fr: 'Nous publions une capacité une fois que la plateforme la démontre. En préparation :',
    en: 'We publish a capability once the platform demonstrates it. In progress:',
  },
  roadmap: [
    {
      fr: 'Un mode souverain strict, sans aucun service hors UE obligatoire.',
      en: 'A strict sovereignty mode with no mandatory non-EU service.',
    },
    {
      fr: 'L’installation hors ligne depuis une archive signée, et les mises à jour de la plateforme en une seule opération.',
      en: 'Offline installation from a signed bundle, and platform upgrades in a single operation.',
    },
    {
      fr: 'Des projets en libre-service avec leurs quotas, leurs rôles et leurs bases de données.',
      en: 'Self-service projects with their own quotas, roles and databases.',
    },
  ] satisfies Bilingual[],
  faq: [
    {
      question: {
        fr: 'Où sont stockées nos données ?',
        en: 'Where is our data stored?',
      },
      answer: {
        fr: 'Sur les serveurs que vous choisissez : loués chez un hébergeur européen, installés dans vos locaux, ou opérés par Swirl sur des serveurs hébergés dans l’UE. La plateforme tient la liste de chaque service externe qu’elle contacte et des données qu’il reçoit, et la télémétrie des éditeurs est désactivée.',
        en: 'On the servers you choose: rented from a European host, installed on your premises, or operated by Swirl on servers hosted in the EU. The platform keeps a list of every external service it contacts and the data each receives, and vendor telemetry is switched off.',
      },
    },
    {
      question: {
        fr: 'Faut-il des compétences techniques spécialisées ?',
        en: 'Do we need specialist platform skills?',
      },
      answer: {
        fr: 'Pas pour l’installer ni pour l’exploiter au quotidien. Le hub d’installation installe la plateforme, ajoute des serveurs et la vérifie ; les applications se déploient depuis leur dépôt de code ; chaque alerte renvoie à sa procédure. Swirl peut aussi l’installer avec vous, ou l’exploiter pour vous.',
        en: 'Not to install it or run it day to day. The setup hub installs the platform, adds servers and verifies it; applications deploy from their repository; every alert links to its runbook. Swirl can also install it with you, or run it for you.',
      },
    },
    {
      question: {
        fr: 'Comment Swirl Cloud aide-t-il pour NIS2 et DORA ?',
        en: 'How does Swirl Cloud help with NIS2 and DORA?',
      },
      answer: {
        fr: 'Il produit les preuves techniques : des contrôles rattachés à NIS2, ISO/IEC 27001, DORA et au RGPD sont évalués en continu, un dossier de preuves signé se vérifie hors ligne, et les rapports d’incident sont préparés avec les échéances de NIS2 et du RGPD. La conformité dépend aussi de vos politiques et de votre organisation.',
        en: 'It produces the technical evidence: controls mapped to NIS2, ISO/IEC 27001, DORA and GDPR are evaluated continuously, a signed evidence pack is verified offline, and incident reports are drafted with the NIS2 and GDPR deadlines. Compliance also depends on your own policies and organization.',
      },
    },
    {
      question: {
        fr: 'Combien coûte Swirl Cloud ?',
        en: 'What does Swirl Cloud cost?',
      },
      answer: {
        fr: 'L’infrastructure coûte le prix mensuel fixe de vos serveurs, sans facturation à l’usage, et la plateforme répartit ce coût par environnement et par application. Contactez-nous pour l’installation, l’exploitation par Swirl et l’accompagnement.',
        en: 'The infrastructure costs the fixed monthly price of your servers, with no usage billing, and the platform shows that cost per environment and application. Contact us for installation, operation by Swirl and support.',
      },
    },
    {
      question: {
        fr: 'Pouvons-nous quitter Swirl Cloud ?',
        en: 'Can we leave Swirl Cloud?',
      },
      answer: {
        fr: 'La plateforme repose principalement sur des composants open source répandus, et vos données restent dans des formats standard, sur vos serveurs. Une procédure documentée d’exploitation autonome et de sortie est en préparation.',
        en: 'The platform is built mainly on widely used open-source components, and your data stays in standard formats on your servers. A documented self-operation and exit runbook is in progress.',
      },
    },
  ],
};
