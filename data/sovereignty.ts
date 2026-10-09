import type { Bilingual } from './portfolio.ts';

// Swirl Cloud sovereignty page, from the platform's external-services guide.
// Name every outside service the platform contacts and what it receives; the
// strict sovereignty mode and the exit runbook are roadmap until they ship.
type Card = { title: Bilingual; text: Bilingual };
const same = (text: string): Bilingual => ({ fr: text, en: text });

export const sovereignty = {
  title: {
    fr: 'Souveraineté de Swirl Cloud : où vont vos données',
    en: 'Swirl Cloud Sovereignty: Where Your Data Goes',
  },
  description: {
    fr: 'Où vivent vos données avec Swirl Cloud, chaque service externe contacté et ce qu’il reçoit, la télémétrie désactivée et la feuille de route souveraine.',
    en: 'Where your data lives with Swirl Cloud, every outside service it contacts and what each receives, telemetry switched off, and the sovereignty roadmap.',
  },
  heading: {
    fr: 'Vos données restent là où vous les placez.',
    en: 'Your data stays where you put it.',
  },
  accent: {
    fr: 'Chaque service externe est listé.',
    en: 'Every outside service is listed.',
  },
  lead: {
    fr: 'Swirl Cloud fonctionne sur les serveurs et chez l’hébergeur que vous choisissez, donc sous la juridiction que vous choisissez. La plateforme documente chaque service externe qu’elle contacte et ce qu’il reçoit, désactive la télémétrie des éditeurs et repose principalement sur des composants open source que vous pouvez exploiter vous-même.',
    en: 'Swirl Cloud runs on the servers and at the host you choose, and so under the jurisdiction you choose. The platform documents every outside service it contacts and what each receives, switches vendor telemetry off and is built mainly on open-source components you can operate yourself.',
  },
  tags: ['EU · RGPD · GDPR', 'Open source', 'Vault', 'Restic'],
  control: [
    {
      title: { fr: 'Vos serveurs', en: 'Your servers' },
      text: {
        fr: 'Loués chez l’hébergeur et dans le pays de votre choix, installés dans vos locaux, ou opérés par Swirl chez un opérateur de l’Union européenne. Applications, bases de données et sauvegardes locales y restent.',
        en: 'Rented from the host and in the country you choose, installed on your premises, or operated by Swirl at an operator in the European Union. Applications, databases and local backups stay there.',
      },
    },
    {
      title: { fr: 'Vos clés', en: 'Your keys' },
      text: {
        fr: 'Vault conserve les secrets sur votre installation, et vos administrateurs exportent le kit de récupération. Les droits d’administration sont accordés pour une durée limitée et enregistrés.',
        en: 'Vault keeps the secrets on your installation, and your administrators export the recovery kit. Administrator rights are time-limited and recorded.',
      },
    },
    {
      title: { fr: 'Vos sauvegardes', en: 'Your backups' },
      text: {
        fr: 'L’archive nocturne reste sur vos serveurs ; la copie hors site, si vous la choisissez, est chiffrée avant l’envoi vers le stockage S3 de votre choix.',
        en: 'The nightly archive stays on your servers; the off-site copy, if you choose one, is encrypted before it is sent to the S3 storage you pick.',
      },
    },
    {
      title: { fr: 'Aucune télémétrie d’usage', en: 'No usage telemetry' },
      text: {
        fr: 'Les rapports d’usage et les vérifications de version de GitLab, Grafana, Kibana, SonarQube, Portainer, Longhorn, Traefik et Odoo sont désactivés.',
        en: 'Usage reports and version checks in GitLab, Grafana, Kibana, SonarQube, Portainer, Longhorn, Traefik and Odoo are switched off.',
      },
    },
  ] satisfies Card[],
  // Outside services contacted while installing or running, as listed in the
  // platform's external-services guide.
  services: [
    {
      name: same('Cloudflare'),
      provider: {
        fr: 'Cloudflare, Inc. (États-Unis)',
        en: 'Cloudflare, Inc. (United States)',
      },
      use: {
        fr: 'DNS public, TLS en périphérie, protection DDoS, accès aux outils d’administration',
        en: 'Public DNS, edge TLS, DDoS protection, sign-in gate for administration tools',
      },
      receives: {
        fr: 'La zone DNS, tout le trafic web public (déchiffré en périphérie) et les identités de connexion d’administration',
        en: 'The DNS zone, all public web traffic (decrypted at the edge) and administration sign-in identities',
      },
      optional: false,
      note: {
        fr: 'Protège les adresses publiques ; une installation privée s’en passe.',
        en: 'Protects public addresses; a private installation does without it.',
      },
    },
    {
      name: same('Tailscale'),
      provider: {
        fr: 'Tailscale Inc. (Canada)',
        en: 'Tailscale Inc. (Canada)',
      },
      use: {
        fr: 'Réseau privé entre serveurs, si vous le choisissez',
        en: 'Private network between servers, if you choose it',
      },
      receives: {
        fr: 'Les clés publiques, noms et adresses des serveurs ; le trafic reste chiffré de bout en bout',
        en: 'Server public keys, names and addresses; traffic stays end-to-end encrypted',
      },
      optional: true,
      note: {
        fr: 'Alternatives : OVHcloud vRack ou votre réseau local.',
        en: 'Alternatives: OVHcloud vRack or your local network.',
      },
    },
    {
      name: same('GitHub'),
      provider: {
        fr: 'GitHub, Inc., Microsoft (États-Unis)',
        en: 'GitHub, Inc., Microsoft (United States)',
      },
      use: {
        fr: 'Import et synchronisation de dépôts, si vous le choisissez',
        en: 'Repository import and mirroring, if you choose it',
      },
      receives: {
        fr: 'Le contenu et l’historique des dépôts synchronisés',
        en: 'Content and history of mirrored repositories',
      },
      optional: true,
      note: {
        fr: 'Les dépôts peuvent rester uniquement dans votre GitLab.',
        en: 'Repositories can stay in your GitLab only.',
      },
    },
    {
      name: same('OVHcloud API'),
      provider: { fr: 'OVH SAS (France)', en: 'OVH SAS (France)' },
      use: {
        fr: 'Rattachement automatique des nouveaux serveurs au vRack',
        en: 'Automatic vRack attachment of new servers',
      },
      receives: {
        fr: 'Les noms des serveurs et du vRack',
        en: 'Server and vRack names',
      },
      optional: true,
      note: {
        fr: 'Les serveurs peuvent être rattachés à la main.',
        en: 'Servers can be attached by hand.',
      },
    },
    {
      name: { fr: 'Stockage de sauvegarde S3', en: 'S3 backup storage' },
      provider: { fr: 'Choisi par vous', en: 'Chosen by you' },
      use: {
        fr: 'Copie hors site des archives de restauration et des volumes',
        en: 'Off-site copy of recovery archives and volumes',
      },
      receives: {
        fr: 'Des archives chiffrées avant l’envoi',
        en: 'Archives encrypted before upload',
      },
      optional: true,
      note: {
        fr: 'Ou une autre machine que vous contrôlez.',
        en: 'Or another machine you control.',
      },
    },
    {
      name: same('CrowdSec'),
      provider: { fr: 'CrowdSec SAS (France)', en: 'CrowdSec SAS (France)' },
      use: {
        fr: 'Liste de blocage communautaire sur les serveurs exposés',
        en: 'Community block list on internet-exposed servers',
      },
      receives: {
        fr: 'Les adresses qui ont attaqué le serveur et les scénarios détectés',
        en: 'Addresses that attacked the server and the matching scenarios',
      },
      optional: false,
      note: {
        fr: 'Actif par défaut, en échange de la liste de blocage.',
        en: 'Active by default, in exchange for the block list.',
      },
    },
  ],
  downloads: {
    fr: 'Les images et paquets proviennent de registres publics (Docker Hub, Quay, GitHub, Elastic, Kubernetes, Ubuntu, CrowdSec), qui ne voient que l’adresse qui télécharge et ce qui est téléchargé. Chaque image est figée par son empreinte.',
    en: 'Images and packages come from public registries (Docker Hub, Quay, GitHub, Elastic, Kubernetes, Ubuntu, CrowdSec), which only see the downloading address and what is downloaded. Every image is pinned by its digest.',
  },
  roadmap: [
    {
      fr: 'Un mode souverain strict qui refuse toute dépendance hors UE ou non auto-hébergée et signale chaque appel externe restant.',
      en: 'A strict sovereignty mode that refuses any non-EU or non-self-hosted dependency and reports every remaining external call.',
    },
    {
      fr: 'Un réseau privé auto-hébergé (Headscale, NetBird ou WireGuard) à la place de Tailscale.',
      en: 'A self-hosted private network (Headscale, NetBird or WireGuard) in place of Tailscale.',
    },
    {
      fr: 'L’installation hors ligne depuis une archive signée, sans téléchargement depuis les registres publics.',
      en: 'Offline installation from a signed bundle, with no downloads from public registries.',
    },
    {
      fr: 'Une procédure de sortie documentée pour exploiter la plateforme sans Swirl.',
      en: 'A documented exit procedure to run the platform without Swirl.',
    },
  ] satisfies Bilingual[],
  exit: {
    fr: 'Votre code est dans Git, vos images dans un registre OCI, vos bases se sauvegardent aux formats standard de PostgreSQL et de MongoDB, et vos déploiements sont des manifestes Kubernetes dans Git. Rien de tout cela ne dépend d’un format propre à Swirl.',
    en: 'Your code is in Git, your images in an OCI registry, your databases dump to standard PostgreSQL and MongoDB formats, and your deployments are Kubernetes manifests in Git. None of it depends on a Swirl-specific format.',
  },
  faq: [
    {
      question: {
        fr: 'Des données quittent-elles nos serveurs ?',
        en: 'Does any data leave our servers?',
      },
      answer: {
        fr: 'Seulement vers les services listés sur cette page, pour l’usage indiqué. Les données des applications, les secrets et les sauvegardes restent sur votre installation, sauf la copie hors site que vous choisissez, chiffrée avant l’envoi.',
        en: 'Only to the services listed on this page, for the purpose shown. Application data, secrets and backups stay on your installation, except the off-site copy you choose, which is encrypted before upload.',
      },
    },
    {
      question: {
        fr: 'Où sont les serveurs quand Swirl exploite la plateforme ?',
        en: 'Where are the servers when Swirl runs the platform?',
      },
      answer: {
        fr: 'Chez un opérateur de l’Union européenne. Vous pouvez aussi faire tourner Swirl Cloud sur des serveurs de votre choix, loués ou dans vos locaux.',
        en: 'With an operator in the European Union. You can also run Swirl Cloud on servers of your choice, rented or on your premises.',
      },
    },
  ],
};
