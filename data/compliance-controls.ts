import type { Bilingual } from './portfolio.ts';
import type { Framework } from './compliance-frameworks.ts';

// Swirl Cloud's control catalog (compliance-controls.yaml in the platform
// repository), grouped by theme. Each control states what it checks, not that
// it passes; keep titles, mappings and the automated flag aligned with it.
export interface Control {
  title: Bilingual;
  objective: Bilingual;
  refs: Partial<Record<Framework, string[]>>;
  // Evaluated continuously from telemetry; otherwise proven by documents.
  automated: boolean;
}

const control = (
  fr: [string, string],
  en: [string, string],
  refs: Control['refs'],
  automated = true,
): Control => ({
  title: { fr: fr[0], en: en[0] },
  objective: { fr: fr[1], en: en[1] },
  refs,
  automated,
});

export const controlGroups: { theme: Bilingual; controls: Control[] }[] = [
  {
    theme: { fr: 'Identité et accès', en: 'Identity and access' },
    controls: [
      control(
        [
          'Identité centrale et authentification SSO',
          'Les personnes se connectent aux services par un seul fournisseur d’identité, qui applique les règles de mot de passe et de protection contre la force brute ; les comptes locaux ne servent qu’en secours.',
        ],
        [
          'Central identity and single sign-on',
          'People sign in to platform services through one identity provider that enforces password and brute-force policy; local accounts exist only for break-glass access.',
        ],
        {
          nis2: ['21(2)(i)'],
          iso27001: ['A.5.15', 'A.5.16', 'A.5.17', 'A.8.5'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(b)'],
        },
      ),
      control(
        [
          'Double authentification des administrateurs',
          'L’accès d’administration à la plateforme exige un second facteur.',
        ],
        [
          'Multi-factor authentication for administrators',
          'Administrator access to the platform requires a second factor.',
        ],
        {
          nis2: ['21(2)(j)'],
          iso27001: ['A.8.2', 'A.8.5'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(b)'],
        },
        false,
      ),
      control(
        [
          'Revue périodique des accès',
          'Les responsables confirment ou retirent régulièrement les rôles de chaque personne, comptes locaux compris.',
        ],
        [
          'Periodic access review',
          'Owners periodically confirm or revoke every person’s roles, including local accounts outside single sign-on.',
        ],
        { nis2: ['21(2)(i)'], iso27001: ['A.5.18', 'A.8.2'], dora: ['Art. 9'] },
        false,
      ),
      control(
        [
          'Gestion des secrets',
          'Les identifiants sont conservés dans Vault, transmis aux applications par External Secrets, jamais stockés dans Git, et renouvelés avant leur limite d’âge.',
        ],
        [
          'Secrets management',
          'Credentials live in Vault, are delivered to workloads by External Secrets, are never stored in Git, and are rotated before they age past the limit.',
        ],
        {
          nis2: ['21(2)(h)'],
          iso27001: ['A.5.17', 'A.8.24'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(a)'],
          cis: ['Kubernetes 5.4.2'],
        },
      ),
    ],
  },
  {
    theme: { fr: 'Détection et réponse', en: 'Detection and response' },
    controls: [
      control(
        [
          'Journalisation de sécurité',
          'Les événements de l’API Kubernetes, du coffre de secrets et de l’identité sont enregistrés de façon centrale, avec une durée de conservation définie.',
        ],
        [
          'Security audit logging',
          'Kubernetes API, secret-store and identity events are recorded centrally with defined retention.',
        ],
        {
          nis2: ['21(2)(b)'],
          iso27001: ['A.8.15', 'A.5.28'],
          dora: ['Art. 10'],
          gdpr: ['Art. 32(1)(b)'],
          cis: ['Kubernetes 3.2.1', 'Kubernetes 3.2.2'],
        },
      ),
      control(
        [
          'Supervision et alertes de sécurité',
          'La collecte des métriques et l’acheminement des alertes fonctionnent en continu, pour qu’un problème détecté parvienne à un opérateur.',
        ],
        [
          'Security monitoring and alerting',
          'Metrics collection and alert routing run continuously so detected problems reach an operator.',
        ],
        {
          nis2: ['21(2)(b)'],
          iso27001: ['A.8.16'],
          dora: ['Art. 10'],
          gdpr: ['Art. 32(1)(b)'],
        },
      ),
      control(
        [
          'Prévention des intrusions',
          'Fail2ban et CrowdSec bloquent la force brute et les sources malveillantes connues sur chaque serveur.',
        ],
        [
          'Host intrusion prevention',
          'Fail2ban and CrowdSec block brute-force and known-bad sources on every host.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.16', 'A.8.20'],
          dora: ['Art. 10'],
          gdpr: ['Art. 32(1)(b)'],
        },
      ),
      control(
        [
          'Intégrité des fichiers et logiciels malveillants',
          'AIDE et rkhunter vérifient au moins chaque semaine que les fichiers des serveurs n’ont pas changé de façon inattendue et qu’aucun rootkit n’est présent.',
        ],
        [
          'File integrity and malware checks',
          'AIDE and rkhunter check host files for unexpected changes and rootkits at least weekly.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.7', 'A.8.16'],
          dora: ['Art. 10'],
          cis: ['Ubuntu: filesystem integrity checking'],
        },
      ),
      control(
        [
          'Gestion et notification des incidents',
          'Les incidents de sécurité sont détectés, traités, enregistrés et notifiés dans les délais réglementaires.',
        ],
        [
          'Incident handling and notification',
          'Security incidents are detected, handled, recorded and notified within regulatory deadlines.',
        ],
        {
          nis2: ['21(2)(b)', '23'],
          iso27001: ['A.5.24', 'A.5.25', 'A.5.26', 'A.5.27'],
          dora: ['Art. 17', 'Art. 19'],
          gdpr: ['Art. 33'],
        },
        false,
      ),
    ],
  },
  {
    theme: {
      fr: 'Durcissement et vulnérabilités',
      en: 'Hardening and vulnerabilities',
    },
    controls: [
      control(
        [
          'Pare-feu des serveurs, refus par défaut',
          'Chaque serveur rejette le trafic entrant non sollicité, sauf les ports d’administration, d’entrée et de cluster documentés.',
        ],
        [
          'Default-deny host firewall',
          'Each host drops unsolicited inbound traffic except documented management, ingress and cluster ports.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.20', 'A.8.22'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(b)'],
          cis: ['Ubuntu: host-based firewall'],
        },
      ),
      control(
        [
          'Segmentation réseau entre applications',
          'Chaque espace de noms applicatif restreint son trafic par des NetworkPolicies.',
        ],
        [
          'Network segmentation between workloads',
          'Every workload namespace restricts traffic with NetworkPolicies.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.22'],
          dora: ['Art. 9'],
          cis: ['Kubernetes 5.3.2'],
        },
      ),
      control(
        [
          'Isolation des charges (Pod Security Standards)',
          'Les charges respectent le profil Baseline des Pod Security Standards de Kubernetes.',
        ],
        [
          'Workload isolation (Pod Security Standards)',
          'Workloads meet the Kubernetes Pod Security Standards Baseline profile.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.9'],
          dora: ['Art. 9'],
          cis: ['Kubernetes 5.2'],
        },
      ),
      control(
        [
          'Benchmark de configuration Kubernetes',
          'La configuration du cluster est évaluée en continu face au CIS Kubernetes Benchmark.',
        ],
        [
          'Kubernetes configuration benchmark',
          'The cluster configuration is assessed continuously against the CIS Kubernetes Benchmark.',
        ],
        {
          nis2: ['21(2)(f)'],
          iso27001: ['A.8.9'],
          dora: ['Art. 9'],
          cis: ['Kubernetes benchmark'],
        },
      ),
      control(
        [
          'Audit de durcissement des serveurs',
          'Les serveurs sont audités chaque mois avec Lynis et restent au niveau de durcissement accepté ou au-dessus.',
        ],
        [
          'Host hardening audit',
          'Hosts are audited monthly with Lynis and stay at or above the accepted hardening level.',
        ],
        {
          nis2: ['21(2)(f)'],
          iso27001: ['A.8.9'],
          gdpr: ['Art. 32(1)(d)'],
          cis: ['Ubuntu: benchmark audit'],
        },
      ),
      control(
        [
          'Mises à jour de sécurité',
          'Les serveurs installent automatiquement les mises à jour de sécurité et redémarrent sous une semaine quand une mise à jour l’exige.',
        ],
        [
          'Security updates',
          'Hosts install security updates automatically and restart within a week when an update requires it.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.8', 'A.8.19'],
          dora: ['Art. 9'],
          cis: ['Ubuntu: software updates'],
        },
      ),
      control(
        [
          'Gestion des vulnérabilités',
          'Les images en fonctionnement sont analysées en continu et chaque nouvelle vulnérabilité critique est triée.',
        ],
        [
          'Vulnerability management',
          'Running images are scanned continuously and new critical vulnerabilities are triaged.',
        ],
        {
          nis2: ['21(2)(e)'],
          iso27001: ['A.8.8'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(d)'],
        },
      ),
      control(
        [
          'Chiffrement en transit',
          'Les adresses publiques utilisent des certificats TLS valides, renouvelés avant leur expiration.',
        ],
        [
          'Encryption in transit',
          'Public endpoints use valid TLS certificates that are renewed before expiry.',
        ],
        {
          nis2: ['21(2)(h)'],
          iso27001: ['A.8.24'],
          dora: ['Art. 9'],
          gdpr: ['Art. 32(1)(a)'],
        },
      ),
    ],
  },
  {
    theme: {
      fr: 'Continuité et exploitation',
      en: 'Continuity and operations',
    },
    controls: [
      control(
        [
          'Sauvegardes',
          'Les archives de restauration et les volumes persistants sont sauvegardés chaque jour hors du domaine de panne.',
        ],
        [
          'Backups',
          'Platform recovery archives and persistent volumes are backed up daily outside the failure domain.',
        ],
        {
          nis2: ['21(2)(c)'],
          iso27001: ['A.8.13'],
          dora: ['Art. 12'],
          gdpr: ['Art. 32(1)(c)'],
        },
      ),
      control(
        [
          'Reprise et continuité d’activité',
          'L’organisation peut restaurer la plateforme et ses données dans les objectifs de reprise convenus.',
        ],
        [
          'Recovery and business continuity',
          'The organization can restore the platform and its data within agreed recovery objectives.',
        ],
        {
          nis2: ['21(2)(c)'],
          iso27001: ['A.5.29', 'A.5.30'],
          dora: ['Art. 11', 'Art. 12'],
          gdpr: ['Art. 32(1)(c)'],
        },
        false,
      ),
      control(
        [
          'Objectifs de disponibilité',
          'Chaque adresse publique est sondée en continu face à un objectif de 99,5 %, et une consommation rapide ou durable du budget d’erreur alerte un opérateur.',
        ],
        [
          'Service availability objectives',
          'Every public endpoint is probed continuously against a 99.5% availability objective, and fast or sustained budget burn alerts an operator.',
        ],
        {
          nis2: ['21(2)(c)'],
          iso27001: ['A.8.14', 'A.8.16'],
          dora: ['Art. 9', 'Art. 11'],
          gdpr: ['Art. 32(1)(b)'],
        },
      ),
      control(
        [
          'Gestion des changements',
          'Les changements de la plateforme et des applications sont appliqués depuis des révisions Git revues, sans dérive de l’état réel.',
        ],
        [
          'Change and configuration management',
          'Platform and application changes are applied from reviewed Git revisions and live state does not drift.',
        ],
        { nis2: ['21(2)(e)'], iso27001: ['A.8.9', 'A.8.32'], dora: ['Art. 9'] },
      ),
      control(
        [
          'Gestion de la capacité',
          'La marge de stockage et de calcul est surveillée pour qu’aucun service ne tombe faute de ressources.',
        ],
        [
          'Capacity management',
          'Storage and compute headroom is monitored so services are not lost to exhaustion.',
        ],
        { iso27001: ['A.8.6'], dora: ['Art. 9'], gdpr: ['Art. 32(1)(b)'] },
      ),
    ],
  },
  {
    theme: { fr: 'Gouvernance', en: 'Governance' },
    controls: [
      control(
        [
          'Gestion des risques et politique de sécurité',
          'Les risques de sécurité de l’information sont évalués et traités dans le cadre d’une politique approuvée.',
        ],
        [
          'Risk management and security policy',
          'Information security risks are assessed and treated under an approved policy.',
        ],
        {
          nis2: ['21(2)(a)'],
          iso27001: ['A.5.1'],
          dora: ['Art. 6'],
          gdpr: ['Art. 32(2)'],
        },
        false,
      ),
      control(
        [
          'Registre des traitements',
          'Chaque traitement de données personnelles est inscrit avec ses finalités, ses données, ses destinataires, son stockage et sa durée de conservation.',
        ],
        [
          'Records of processing activities',
          'Every processing of personal data is recorded with its purposes, data, recipients, storage and retention.',
        ],
        { nis2: ['21(2)(i)'], iso27001: ['A.5.34'], gdpr: ['Art. 30'] },
        false,
      ),
      control(
        [
          'Sécurité des fournisseurs et de la chaîne d’approvisionnement',
          'Les services externes et les fournisseurs de logiciels sont inventoriés, évalués et couverts par des accords.',
        ],
        [
          'Supplier and supply-chain security',
          'External services and software suppliers are inventoried, assessed and covered by agreements.',
        ],
        {
          nis2: ['21(2)(d)'],
          iso27001: ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22'],
          dora: ['Art. 28'],
          gdpr: ['Art. 28'],
        },
        false,
      ),
      control(
        [
          'Sensibilisation et sécurité du personnel',
          'Le personnel est formé, et les arrivées, mobilités et départs reçoivent et perdent leurs accès à temps.',
        ],
        [
          'Security awareness and personnel security',
          'Staff are trained, and joiners, movers and leavers receive and lose access on time.',
        ],
        {
          nis2: ['21(2)(g)', '21(2)(i)'],
          iso27001: ['A.6.1', 'A.6.3', 'A.6.5'],
        },
        false,
      ),
      control(
        [
          'Évaluation de l’efficacité',
          'Les mesures de sécurité sont testées et revues régulièrement, et leurs constats sont suivis jusqu’à leur clôture.',
        ],
        [
          'Effectiveness assessment',
          'Security measures are tested and reviewed regularly, and findings are tracked to closure.',
        ],
        {
          nis2: ['21(2)(f)'],
          iso27001: ['A.5.35', 'A.5.36'],
          dora: ['Art. 24', 'Art. 25'],
          gdpr: ['Art. 32(1)(d)'],
        },
        false,
      ),
    ],
  },
];
