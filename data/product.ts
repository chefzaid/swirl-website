import type { Bilingual } from './portfolio.ts';

// Swirl Cloud product page. State only what the platform already does (its
// features guide in the platform repository); anything still being built goes
// in `roadmap` or carries `available: false`.
type Card = { title: Bilingual; text: Bilingual };

export const product = {
  name: 'Swirl Cloud',
  // Search title after the "Swirl | " brand prefix, and meta description.
  title: {
    fr: 'Swirl Cloud, cloud privé d’entreprise sur serveurs dédiés',
    en: 'Swirl Cloud, a Private Company Cloud on Bare Metal',
  },
  description: {
    fr: 'Swirl Cloud installe une plateforme d’entreprise complète sur vos serveurs : déploiement, SSO, données, supervision, sécurité, Odoo et preuves de conformité.',
    en: 'Swirl Cloud installs a complete company platform on your own servers: delivery, single sign-on, data, monitoring, security, Odoo and compliance evidence.',
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
    fr: 'Swirl Cloud installe sur des serveurs dédiés, loués ou à vous, ce qu’une entreprise assemble sinon chez un hyperscaler et plusieurs éditeurs SaaS : déploiement des applications, authentification unique, bases de données, supervision, sécurité et l’ERP Odoo. Les preuves de conformité sont produites par la plateforme en fonctionnement, et l’infrastructure coûte le prix mensuel fixe de vos serveurs, sans facturation à l’usage.',
    en: 'Swirl Cloud installs what a company otherwise assembles from a hyperscaler and several SaaS vendors on rented or owned bare-metal servers: application delivery, single sign-on, databases, monitoring, security and the Odoo ERP. Compliance evidence comes from the running platform, and the infrastructure costs the fixed monthly price of your servers, not usage billing.',
  },
  tags: ['Bare metal · K3s', 'GitLab · Argo CD', 'Keycloak · Vault', 'Odoo'],
  audienceIntro: {
    fr: 'Les entreprises de 20 à 500 personnes qui ont besoin d’une plateforme, d’une facture prévisible et de preuves d’audit, sans équipe plateforme dédiée.',
    en: 'Companies of 20 to 500 people that need a platform, a predictable bill and audit evidence, without a platform team of their own.',
  },
  audiences: [
    {
      title: {
        fr: 'Les entreprises sans équipe plateforme',
        en: 'Companies without a platform team',
      },
      text: {
        fr: 'Les distributions Kubernetes supposent des ingénieurs plateforme en interne. Le hub d’installation de Swirl Cloud installe la plateforme, ajoute des serveurs et vérifie le résultat, et chaque alerte renvoie à sa procédure.',
        en: 'Kubernetes distributions expect in-house platform engineers. The Swirl Cloud setup hub installs the platform, adds servers and verifies the result, and every alert links to its runbook.',
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
    fr: 'Une installation pilotée depuis Git et organisée en couches. Tout ce qui suit est disponible aujourd’hui.',
    en: 'One installation, managed from Git and organized in layers. Everything below is available today.',
  },
  layers: [
    {
      title: { fr: 'Serveurs et stockage', en: 'Servers and storage' },
      text: {
        fr: 'Kubernetes (K3s) sur un ou plusieurs serveurs Ubuntu LTS, loués ou à vous, reliés par un réseau privé. Stockage répliqué Longhorn avec volumes chiffrés au choix, et une archive de restauration quotidienne, chiffrable et copiable hors site.',
        en: 'Kubernetes (K3s) on one or more Ubuntu LTS servers, rented or owned, joined by a private network. Replicated Longhorn storage with optional encrypted volumes, and a daily recovery archive that can be encrypted and copied off site.',
      },
    },
    {
      title: { fr: 'Accès et identité', en: 'Access and identity' },
      text: {
        fr: 'Une authentification unique Keycloak, en français et en anglais, pour tous les outils d’administration. Les droits d’administrateur sont accordés pour 1 à 24 heures, approuvés, enregistrés et retirés automatiquement.',
        en: 'Keycloak single sign-on, in English and French, for every administration tool. Administrator rights are granted for 1 to 24 hours, approved, recorded and removed automatically.',
      },
    },
    {
      title: { fr: 'Livraison des applications', en: 'Application delivery' },
      text: {
        fr: 'GitLab pour le code, les pipelines CI et le registre d’images ; Argo CD déploie depuis Git vers les environnements int, uat et prod. Chaque application rejoint la plateforme par un contrat déclaratif et un premier déploiement vérifié.',
        en: 'GitLab for code, CI pipelines and the container registry; Argo CD deploys from Git to int, uat and prod environments. Each application joins through a declarative contract and a verified first deployment.',
      },
    },
    {
      title: { fr: 'Données et secrets', en: 'Data and secrets' },
      text: {
        fr: 'PostgreSQL, MongoDB, Redis et Kafka, avec des identifiants distincts par environnement. Vault conserve les secrets, transmis aux applications par External Secrets.',
        en: 'PostgreSQL, MongoDB, Redis and Kafka, with separate credentials per environment. Vault holds the secrets and External Secrets delivers them to applications.',
      },
    },
    {
      title: { fr: 'Supervision et coûts', en: 'Monitoring and costs' },
      text: {
        fr: 'Prometheus, Grafana et Elasticsearch, avec des tableaux de bord par application. Chaque adresse publique est sondée face à un objectif de disponibilité de 99,5 %, et le coût mensuel de chaque serveur est réparti par environnement et par application.',
        en: 'Prometheus, Grafana and Elasticsearch, with dashboards per application. Every public address is probed against a 99.5% availability objective, and each server’s monthly cost is shown per environment and application.',
      },
    },
    {
      title: { fr: 'Sécurité opérationnelle', en: 'Security operations' },
      text: {
        fr: 'Analyse des vulnérabilités et des configurations (Trivy), qualité du code (SonarQube), CrowdSec et Fail2ban sur les serveurs exposés, politiques d’admission, et alertes sur les connexions suspectes, les changements de droits et les accès aux secrets.',
        en: 'Vulnerability and configuration scanning (Trivy), code quality (SonarQube), CrowdSec and Fail2ban on exposed servers, admission policies, and alerts on suspicious logins, permission changes and secret access.',
      },
    },
    {
      title: { fr: 'Preuves de conformité', en: 'Compliance evidence' },
      text: {
        fr: 'Des contrôles rattachés à NIS2, ISO/IEC 27001, DORA, au RGPD et aux benchmarks CIS, évalués en continu, un dossier de preuves signé, des revues d’accès, un registre des traitements RGPD et un rapport mensuel conservé 13 mois.',
        en: 'Controls mapped to NIS2, ISO/IEC 27001, DORA, GDPR and the CIS benchmarks, evaluated continuously, a signed evidence pack, access reviews, GDPR records of processing and a monthly report kept for 13 months.',
      },
    },
    {
      title: { fr: 'Applications métier', en: 'Business applications' },
      text: {
        fr: 'L’ERP Odoo avec authentification unique, dont le CRM et le chat en direct qui reçoivent les demandes de ce site.',
        en: 'The Odoo ERP with single sign-on, including the CRM and live chat that handle this website’s inquiries.',
      },
    },
  ] satisfies Card[],
  deliveryIntro: {
    fr: 'Serveurs Ubuntu LTS en x86_64 : à partir de 8 cœurs, 24 Gio de mémoire et 100 Gio de disque libre pour un serveur ; 16 cœurs, 64 Gio et 500 Go NVMe recommandés.',
    en: 'Ubuntu LTS servers on x86_64: from 8 cores, 24 GiB of memory and 100 GiB of free disk for one server; 16 cores, 64 GiB and 500 GB NVMe recommended.',
  },
  delivery: [
    {
      available: true,
      title: { fr: 'Installée chez vous', en: 'Installed on your servers' },
      text: {
        fr: 'Sur des serveurs loués ou dans vos locaux, par vos équipes ou avec Swirl. Le hub d’installation, en français ou en anglais, vérifie le serveur, ne demande que l’essentiel, installe et contrôle le résultat.',
        en: 'On rented servers or on your premises, by your team or with Swirl. The setup hub, in English or French, checks the server, asks only what is needed, installs and verifies the result.',
      },
    },
    {
      available: true,
      title: { fr: 'Exploitée par vos équipes', en: 'Run by your team' },
      text: {
        fr: 'Une procédure pour chaque alerte, un rapport mensuel de disponibilité, de coûts et de conformité, et un suivi de capacité qui indique quoi ajouter et quand.',
        en: 'A runbook for every alert, a monthly report on availability, costs and compliance, and capacity planning that says what to add and when.',
      },
    },
    {
      available: false,
      title: {
        fr: 'Opérée par Swirl, vos clés chez vous',
        en: 'Operated by Swirl, keys kept by you',
      },
      text: {
        fr: 'Une exploitation à distance par un canal sortant que vos administrateurs approuvent et enregistrent ; vous gardez les clés de récupération.',
        en: 'Remote operation through an outbound channel that your administrators approve and record, while you keep the recovery keys.',
      },
    },
  ] satisfies (Card & { available: boolean })[],
  roadmapIntro: {
    fr: 'Nous publions une capacité une fois que la plateforme la démontre. En préparation :',
    en: 'We publish a capability once the platform demonstrates it. In progress:',
  },
  roadmap: [
    {
      fr: 'Un mode souverain strict, sans service hors UE obligatoire : une périphérie réseau sans Cloudflare et un réseau privé auto-hébergé.',
      en: 'A strict sovereignty mode with no mandatory non-EU service: an edge without Cloudflare and a self-hosted private network.',
    },
    {
      fr: 'L’installation hors ligne depuis une archive signée, et les mises à jour de la plateforme en une seule opération.',
      en: 'Offline installation from a signed bundle, and platform upgrades in a single operation.',
    },
    {
      fr: 'Le service opéré, avec accès de support approuvé par vos administrateurs et une console de parc.',
      en: 'The managed service, with support access approved by your administrators and a fleet console.',
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
        fr: 'Sur les serveurs que vous choisissez : loués chez un hébergeur européen ou installés dans vos locaux. La plateforme tient la liste de chaque service externe qu’elle contacte et des données qu’il reçoit, et la télémétrie des éditeurs est désactivée. Tailscale et GitHub sont optionnels ; le trafic public passe aujourd’hui par Cloudflare, et une alternative sans Cloudflare est en préparation.',
        en: 'On the servers you choose: rented from a European host or installed on your premises. The platform keeps a list of every external service it contacts and the data each receives, and vendor telemetry is switched off. Tailscale and GitHub are optional; public traffic goes through Cloudflare today, and an alternative without it is in progress.',
      },
    },
    {
      question: {
        fr: 'Faut-il des compétences Kubernetes ?',
        en: 'Do we need Kubernetes skills?',
      },
      answer: {
        fr: 'Pas pour l’installer ni pour l’exploiter au quotidien. Le hub d’installation installe la plateforme, ajoute des serveurs et la vérifie ; les applications se déploient depuis Git ; chaque alerte renvoie à sa procédure. Swirl peut aussi l’installer avec vous.',
        en: 'Not to install it or run it day to day. The setup hub installs the platform, adds servers and verifies it; applications deploy from Git; every alert links to its runbook. Swirl can also install it with you.',
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
        fr: 'L’infrastructure coûte le prix mensuel fixe de vos serveurs, sans facturation à l’usage, et la plateforme répartit ce coût par environnement et par application. Contactez-nous pour l’installation et l’accompagnement.',
        en: 'The infrastructure costs the fixed monthly price of your servers, with no usage billing, and the platform shows that cost per environment and application. Contact us for installation and support.',
      },
    },
    {
      question: {
        fr: 'Pouvons-nous quitter Swirl Cloud ?',
        en: 'Can we leave Swirl Cloud?',
      },
      answer: {
        fr: 'La plateforme repose principalement sur des composants open source comme Kubernetes, PostgreSQL, GitLab, Keycloak et Odoo, et vos données restent dans leurs formats standard, sur vos serveurs. Une procédure documentée d’exploitation autonome et de sortie est en préparation.',
        en: 'The platform is built mainly on open-source components such as Kubernetes, PostgreSQL, GitLab, Keycloak and Odoo, and your data stays in their standard formats on your servers. A documented self-operation and exit runbook is in progress.',
      },
    },
  ],
};
