import type { Bilingual } from './portfolio.ts';

// "How it works" page for Swirl Cloud. Figures are the platform's own dated
// measurements (its deployment, operations and service-level guides); leave a
// figure out until it has been measured.
type Card = { title: Bilingual; text: Bilingual };
const same = (text: string): Bilingual => ({ fr: text, en: text });

export const howItWorks = {
  title: {
    fr: 'Comment fonctionne Swirl Cloud : installation et architecture',
    en: 'How Swirl Cloud Works: Installation and Architecture',
  },
  description: {
    fr: 'Installation sur vos serveurs, architecture en couches, livraison depuis Git, haute disponibilité et sauvegardes de Swirl Cloud, avec des chiffres mesurés.',
    en: 'How Swirl Cloud installs on your servers, its layered architecture, delivery from Git, high availability and backups, with measured figures.',
  },
  heading: {
    fr: 'Comment fonctionne Swirl Cloud.',
    en: 'How Swirl Cloud works.',
  },
  accent: {
    fr: 'Des serveurs nus aux applications en production.',
    en: 'From bare servers to applications in production.',
  },
  lead: {
    fr: 'Un hub d’installation prépare vos serveurs, installe chaque couche de la plateforme et vérifie le résultat. Ensuite, Git décrit l’état voulu : la plateforme et vos applications s’y alignent en continu.',
    en: 'A setup hub prepares your servers, installs every layer of the platform and verifies the result. From then on, Git describes the desired state, and the platform and your applications continuously converge on it.',
  },
  tags: ['Ubuntu LTS · Kubernetes', 'GitOps', 'Longhorn', 'Vault'],
  // Architecture diagram, from the visitor down to the servers.
  architecture: [
    {
      layer: { fr: 'Accès', en: 'Access' },
      boxes: [
        {
          name: { fr: 'Visiteurs et équipes', en: 'Visitors and teams' },
          detail: { fr: 'Navigateur, Git, API', en: 'Browser, Git, APIs' },
        },
      ],
    },
    {
      layer: { fr: 'Périphérie', en: 'Edge' },
      boxes: [
        {
          name: same('Cloudflare'),
          detail: {
            fr: 'DNS, TLS, pare-feu applicatif, accès d’administration',
            en: 'DNS, TLS, web firewall, administration access',
          },
        },
      ],
    },
    {
      layer: { fr: 'Entrée', en: 'Entry' },
      boxes: [
        {
          name: same('Traefik'),
          detail: { fr: 'Routage des adresses', en: 'Routes every address' },
        },
        {
          name: same('Keycloak'),
          detail: { fr: 'Authentification unique', en: 'Single sign-on' },
        },
      ],
    },
    {
      layer: { fr: 'Services', en: 'Services' },
      boxes: [
        {
          name: { fr: 'Plateforme', en: 'Platform' },
          detail: same(
            'GitLab · Argo CD · Grafana · Kibana · Trivy · SonarQube',
          ),
        },
        {
          name: { fr: 'Vos applications', en: 'Your applications' },
          detail: same('int · uat · prod'),
        },
        { name: same('Odoo'), detail: same('ERP · CRM · chat') },
      ],
    },
    {
      layer: { fr: 'Données', en: 'Data' },
      boxes: [
        {
          name: { fr: 'Bases et messages', en: 'Databases and messaging' },
          detail: same('PostgreSQL · MongoDB · Redis · Kafka'),
        },
        {
          name: same('Vault'),
          detail: {
            fr: 'Secrets, transmis par External Secrets',
            en: 'Secrets, delivered by External Secrets',
          },
        },
      ],
    },
    {
      layer: { fr: 'Socle', en: 'Foundation' },
      boxes: [
        {
          name: same('Kubernetes'),
          detail: {
            fr: 'Sur des serveurs Ubuntu LTS',
            en: 'On Ubuntu LTS servers',
          },
        },
        {
          name: same('Longhorn'),
          detail: { fr: 'Stockage répliqué', en: 'Replicated storage' },
        },
        {
          name: { fr: 'Réseau privé', en: 'Private network' },
          detail: same('vRack · Tailscale · LAN'),
        },
      ],
    },
  ] satisfies {
    layer: Bilingual;
    boxes: { name: Bilingual; detail: Bilingual }[];
  }[],
  install: [
    {
      title: { fr: 'Préparer', en: 'Prepare' },
      text: {
        fr: 'Des serveurs Ubuntu LTS en x86_64, loués ou à vous, et un nom de domaine. Les jetons Cloudflare, GitHub ou Tailscale ne servent que si vous retenez ces options.',
        en: 'Ubuntu LTS servers on x86_64, rented or owned, and a domain name. Cloudflare, GitHub or Tailscale tokens are only needed if you choose those options.',
      },
    },
    {
      title: { fr: 'Répondre au hub', en: 'Answer the hub' },
      text: {
        fr: 'Le hub, en français ou en anglais, vérifie le serveur, ne pose que les questions d’une installation express (ou toutes en mode avancé) et teste vos jetons avant d’installer.',
        en: 'The hub, in English or French, checks the server, asks only what an express installation needs (or everything in advanced mode) and tests your tokens before installing.',
      },
    },
    {
      title: { fr: 'Installer et vérifier', en: 'Install and verify' },
      text: {
        fr: 'Kubernetes, le stockage, l’entrée réseau, Vault, les données, l’authentification unique, GitLab, Argo CD et Odoo sont installés dans l’ordre, puis contrôlés.',
        en: 'Kubernetes, storage, ingress, Vault, data services, single sign-on, GitLab, Argo CD and Odoo are installed in order, then checked.',
      },
    },
    {
      title: { fr: 'Grandir', en: 'Grow' },
      text: {
        fr: 'Le même hub ajoute des serveurs et importe vos dépôts d’applications. Les réponses enregistrées permettent de relancer l’installation sans intervention.',
        en: 'The same hub adds servers and imports your application repositories. Saved answers let you rerun the installation unattended.',
      },
    },
  ] satisfies Card[],
  delivery: [
    {
      title: { fr: 'Pousser', en: 'Push' },
      text: {
        fr: 'Un commit arrive dans le projet GitLab de l’application.',
        en: 'A commit lands in the application’s GitLab project.',
      },
    },
    {
      title: { fr: 'Construire', en: 'Build' },
      text: {
        fr: 'La CI teste le code et publie une image immuable dans le registre de la plateforme.',
        en: 'CI tests the code and publishes an immutable image to the platform registry.',
      },
    },
    {
      title: { fr: 'Promouvoir', en: 'Promote' },
      text: {
        fr: 'La CI inscrit dans Git l’empreinte de l’image pour l’environnement visé : int, uat ou prod.',
        en: 'CI records the image digest in Git for the target environment: int, uat or prod.',
      },
    },
    {
      title: { fr: 'Déployer', en: 'Deploy' },
      text: {
        fr: 'Argo CD applique la version, puis la CI vérifie la révision, la santé et l’adresse publique.',
        en: 'Argo CD applies the release, then CI checks the revision, health and public address.',
      },
    },
  ] satisfies Card[],
  resilience: [
    {
      title: {
        fr: 'Un serveur, puis plusieurs',
        en: 'One server, then several',
      },
      text: {
        fr: 'Tout fonctionne sur un seul serveur. Les serveurs ajoutés rejoignent le cluster par un réseau privé et reçoivent des charges et des répliques de stockage.',
        en: 'Everything runs on a single server. Added servers join the cluster over a private network and take workloads and storage replicas.',
      },
    },
    {
      title: {
        fr: 'Haute disponibilité à la demande',
        en: 'High availability when you need it',
      },
      text: {
        fr: 'Un profil pour trois serveurs de contrôle ou plus : etcd intégré, entrée réseau sur chaque serveur, PostgreSQL, Kafka et Redis répliqués, et un contrôle de préparation avant activation. L’exercice de bascule sur trois serveurs reste à mener.',
        en: 'A profile for three or more control-plane servers: embedded etcd, ingress on every server, replicated PostgreSQL, Kafka and Redis, and a readiness check before activation. The three-server failover drill is still to come.',
      },
    },
    {
      title: { fr: 'Archive de restauration', en: 'Recovery archive' },
      text: {
        fr: 'Chaque nuit : l’état de Kubernetes, un instantané de Vault, les sauvegardes PostgreSQL et MongoDB, les fichiers d’Odoo et la procédure de restauration. Sept copies locales ; en option, une copie chiffrée hors site conservée 7 jours, 5 semaines et 12 mois.',
        en: 'Every night: the Kubernetes state, a Vault snapshot, PostgreSQL and MongoDB dumps, Odoo’s files and the restore procedure. Seven local copies; optionally an encrypted off-site copy kept for 7 days, 5 weeks and 12 months.',
      },
    },
    {
      title: { fr: 'Exercices de panne', en: 'Failure drills' },
      text: {
        fr: 'Hors production, un exercice supprime un pod de chaque service, mesure le temps de retour et sonde les adresses de l’environnement ; le résultat rejoint le rapport mensuel.',
        en: 'Outside production, a drill deletes one pod of each service, measures how long each takes to come back and probes the environment’s addresses; the result goes into the monthly report.',
      },
    },
  ] satisfies Card[],
  measuredIntro: {
    fr: 'Mesuré sur notre propre installation, un serveur, en octobre 2026.',
    en: 'Measured on our own single-server installation in October 2026.',
  },
  measured: [
    {
      label: {
        fr: 'Réservé par les services de la plateforme',
        en: 'Reserved by platform services',
      },
      value: {
        fr: 'environ 5,4 cœurs et 16 Gio',
        en: 'about 5.4 cores and 16 GiB',
      },
    },
    {
      label: {
        fr: 'Pic d’utilisation CPU, applications comprises',
        en: 'Peak CPU use, applications included',
      },
      value: { fr: '3 cœurs', en: '3 cores' },
    },
    {
      label: {
        fr: 'Adresses publiques sondées (objectif 99,5 %)',
        en: 'Public addresses probed (99.5% objective)',
      },
      value: { fr: '25', en: '25' },
    },
    {
      label: {
        fr: 'Retour d’un service après la perte d’un pod',
        en: 'Service back after losing a pod',
      },
      value: { fr: '7 à 47 secondes', en: '7 to 47 seconds' },
    },
    {
      label: {
        fr: 'Point de reprise de l’archive nocturne',
        en: 'Recovery point of the nightly archive',
      },
      value: { fr: 'jusqu’à 24 heures', en: 'up to 24 hours' },
    },
  ] satisfies { label: Bilingual; value: Bilingual }[],
};
