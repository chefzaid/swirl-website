import type { Bilingual, Project, Service } from './portfolio.ts';

// Service landing pages. Keep every statement backed by the homepage service
// cards or a published case study; product claims belong on the Swirl Cloud
// pages.
interface ServicePage {
  // Search title after the "Swirl | " brand prefix, and meta description.
  title: Bilingual;
  description: Bilingual;
  // H1, rendered as heading followed by an accented line.
  heading: Bilingual;
  accent: Bilingual;
  lead: Bilingual;
  capabilities: { title: Bilingual; text: Bilingual }[];
  steps: { title: Bilingual; text: Bilingual }[];
  // Curated case studies, most relevant first; project pages link back.
  projects: Project['id'][];
  faq: { question: Bilingual; answer: Bilingual }[];
}

export const servicePages: Record<Service['id'], ServicePage> = {
  web: {
    title: {
      fr: 'Développement d’applications web et mobiles sur mesure',
      en: 'Custom Web & Mobile Application Development',
    },
    description: {
      fr: 'Applications web et mobiles sur mesure, API et architecture logicielle : Swirl conçoit vos outils métier et les met en production. Références grands comptes.',
      en: 'Custom web and mobile applications, APIs and software architecture: Swirl designs your business tools and takes them to production. Enterprise references.',
    },
    heading: {
      fr: 'Développement d’applications web et mobiles',
      en: 'Custom web and mobile applications,',
    },
    accent: { fr: 'sur mesure.', en: 'built around your business.' },
    lead: {
      fr: 'Des applications conçues pour vos usages métier, reliées à vos outils et à vos données. Swirl prend en charge l’architecture, le développement et la mise en production, avec la même exigence de qualité et de fiabilité depuis 2013.',
      en: 'Applications designed around how your business works, connected to your tools and data. Swirl handles architecture, development and delivery to production, with the same commitment to quality and reliability since 2013.',
    },
    capabilities: [
      {
        title: {
          fr: 'Applications web métier',
          en: 'Business web applications',
        },
        text: {
          fr: 'Portails clients, outils internes et applications de gestion : des interfaces rapides, intuitives et accessibles, pensées pour les personnes qui les utilisent au quotidien.',
          en: 'Customer portals, internal tools and management applications: fast, intuitive and accessible interfaces designed for the people who use them every day.',
        },
      },
      {
        title: {
          fr: 'Applications mobiles Android et iOS',
          en: 'Android and iOS mobile apps',
        },
        text: {
          fr: 'Des applications mobiles qui prolongent vos services auprès de vos clients ou sur le terrain, connectées aux mêmes données que vos outils web.',
          en: 'Mobile apps that extend your services to customers and field users, connected to the same data as your web tools.',
        },
      },
      {
        title: { fr: 'API et intégration', en: 'APIs and integration' },
        text: {
          fr: 'Des API robustes pour connecter vos applications, vos partenaires et vos données, avec des accès adaptés au rôle de chaque utilisateur.',
          en: 'Robust APIs connecting your applications, partners and data, with access tailored to each user’s role.',
        },
      },
      {
        title: {
          fr: 'Architecture et modernisation',
          en: 'Architecture and modernization',
        },
        text: {
          fr: 'Architecture logicielle et urbanisation du système d’information : nous faisons évoluer vos applications existantes pour intégrer vos nouveaux besoins métier.',
          en: 'Software and enterprise architecture: we evolve your existing applications to support new business needs.',
        },
      },
    ],
    steps: [
      {
        title: { fr: 'Comprendre le besoin', en: 'Understand the need' },
        text: {
          fr: 'Vos usages, vos contraintes et vos systèmes existants, avant la première ligne de code.',
          en: 'Your users, constraints and existing systems, before the first line of code.',
        },
      },
      {
        title: {
          fr: 'Concevoir l’architecture',
          en: 'Design the architecture',
        },
        text: {
          fr: 'Des choix techniques expliqués et documentés, pour une application qui dure.',
          en: 'Clear, documented technical decisions for an application built to last.',
        },
      },
      {
        title: { fr: 'Développer et tester', en: 'Build and test' },
        text: {
          fr: 'Des livraisons régulières, des revues de code et des tests automatisés.',
          en: 'Regular releases, code reviews and automated tests.',
        },
      },
      {
        title: { fr: 'Mettre en production', en: 'Go live' },
        text: {
          fr: 'Un déploiement automatisé, puis l’évolution continue de votre application.',
          en: 'Automated deployment, then continuous improvement of your application.',
        },
      },
    ],
    projects: ['bpce', 'engie', 'sg', 'cdc', 'allianz', 'idemia'],
    faq: [
      {
        question: {
          fr: 'Pouvez-vous faire évoluer une application existante ?',
          en: 'Can you improve an existing application?',
        },
        answer: {
          fr: 'Oui. Une grande partie de nos projets consiste à moderniser des applications métier en place : évolution de l’architecture, refonte des interfaces, nouvelles fonctionnalités et automatisation des livraisons, comme pour Allianz Trade ou Bouygues Construction.',
          en: 'Yes. Much of our work modernizes business applications already in use: evolving the architecture, redesigning interfaces, adding features and automating releases, as with Allianz Trade and Bouygues Construction.',
        },
      },
      {
        question: {
          fr: 'Développez-vous à la fois le web et le mobile ?',
          en: 'Do you build both web and mobile apps?',
        },
        answer: {
          fr: 'Oui. Nous concevons des applications web et des applications mobiles Android et iOS, reliées par des API pour partager les mêmes données et les mêmes règles métier.',
          en: 'Yes. We design web applications and Android and iOS mobile apps, connected through APIs so they share the same data and business rules.',
        },
      },
      {
        question: {
          fr: 'Où mon application peut-elle être hébergée ?',
          en: 'Where can my application be hosted?',
        },
        answer: {
          fr: 'Swirl peut héberger votre application dans un cloud privé d’entreprise souverain, hébergé dans l’Union européenne, avec des déploiements automatisés.',
          en: 'Swirl can host your application in a sovereign private enterprise cloud, hosted in the European Union, with automated deployments.',
        },
      },
      {
        question: {
          fr: 'Dans quels secteurs intervenez-vous ?',
          en: 'Which industries do you work with?',
        },
        answer: {
          fr: 'Banque, assurance, énergie, industrie et services. Nos références incluent Crédit Agricole CIB, Société Générale, BPCE / Natixis, ENGIE et Caisse des Dépôts.',
          en: 'Banking, insurance, energy, industry and services. Our references include Crédit Agricole CIB, Société Générale, BPCE / Natixis, ENGIE and Caisse des Dépôts.',
        },
      },
      {
        question: {
          fr: 'Travaillez-vous en français et en anglais ?',
          en: 'Do you work in English and French?',
        },
        answer: {
          fr: 'Oui. Swirl accompagne ses clients en français et en anglais, depuis Paris, New York et Casablanca.',
          en: 'Yes. Swirl works with clients in English and French, from Paris, New York and Casablanca.',
        },
      },
    ],
  },
  embedded: {
    title: {
      fr: 'Développement de logiciels embarqués et objets connectés (IoT)',
      en: 'Embedded Software & IoT Development',
    },
    description: {
      fr: 'Logiciels embarqués et objets connectés, du prototype à la production : Swirl relie vos équipements à votre système d’information et supervise leurs données.',
      en: 'Embedded software and connected devices, from prototype to production: Swirl links your equipment to your business systems and monitors its data in real time.',
    },
    heading: {
      fr: 'Logiciels embarqués et objets connectés,',
      en: 'Embedded software and connected devices,',
    },
    accent: {
      fr: 'du prototype à la production.',
      en: 'from prototype to production.',
    },
    lead: {
      fr: 'Swirl développe le logiciel de vos équipements et les relie à votre système d’information. Des solutions fiables, adaptées aux contraintes de votre matériel, avec des données collectées et supervisées en temps réel.',
      en: 'Swirl builds the software inside your equipment and connects it to your business systems. Reliable solutions designed for your hardware constraints, with data collected and monitored in real time.',
    },
    capabilities: [
      {
        title: { fr: 'Logiciel embarqué', en: 'Embedded software' },
        text: {
          fr: 'Développement en Rust et en Kotlin sur processeurs ARM, ESP32 et Linux embarqué (Yocto), dans le respect des contraintes de mémoire, d’énergie et de fiabilité de votre matériel.',
          en: 'Rust and Kotlin development on ARM processors, ESP32 and embedded Linux (Yocto), within your hardware’s memory, power and reliability constraints.',
        },
      },
      {
        title: { fr: 'Objets connectés', en: 'Connected devices' },
        text: {
          fr: 'Des équipements qui communiquent avec votre système d’information, pour que les données du terrain arrivent dans vos applications.',
          en: 'Equipment that communicates with your business systems, so field data reaches your applications.',
        },
      },
      {
        title: { fr: 'Supervision en temps réel', en: 'Real-time monitoring' },
        text: {
          fr: 'Collecte des données, supervision et administration de parcs d’équipements, des compteurs aux terminaux, depuis un même point de contrôle.',
          en: 'Data collection, monitoring and administration for fleets of equipment, from meters to terminals, in one place.',
        },
      },
      {
        title: {
          fr: 'Simulation et prototypage',
          en: 'Simulation and prototyping',
        },
        text: {
          fr: 'Simulation des composants matériels et prototypes pour valider le logiciel avant son déploiement sur le matériel cible.',
          en: 'Hardware component simulation and prototypes that validate the software before it reaches the target hardware.',
        },
      },
    ],
    steps: [
      {
        title: { fr: 'Cadrer les contraintes', en: 'Frame the constraints' },
        text: {
          fr: 'Matériel, consommation, connectivité et sécurité sont posés dès le départ.',
          en: 'Hardware, power, connectivity and security are defined from day one.',
        },
      },
      {
        title: { fr: 'Prototyper', en: 'Prototype' },
        text: {
          fr: 'Un prototype et des composants simulés pour valider les choix techniques.',
          en: 'A prototype and simulated components to validate technical choices.',
        },
      },
      {
        title: { fr: 'Développer et tester', en: 'Build and test' },
        text: {
          fr: 'Un logiciel testé sur simulateur, puis sur le matériel cible.',
          en: 'Software tested on simulators, then on the target hardware.',
        },
      },
      {
        title: { fr: 'Déployer et superviser', en: 'Deploy and monitor' },
        text: {
          fr: 'Une mise en service suivie et des équipements supervisés en temps réel.',
          en: 'A supported rollout, with equipment monitored in real time.',
        },
      },
    ],
    projects: ['enedis', 'ingenico'],
    faq: [
      {
        question: {
          fr: 'Intervenez-vous dès la phase de prototype ?',
          en: 'Can you start at the prototype stage?',
        },
        answer: {
          fr: 'Oui. Nous accompagnons vos projets du prototype à la production : choix d’architecture, simulation des composants et validation avant le déploiement sur le matériel cible.',
          en: 'Yes. We support projects from prototype to production: architecture choices, component simulation and validation before deployment on the target hardware.',
        },
      },
      {
        question: {
          fr: 'Sur quelles plateformes matérielles travaillez-vous ?',
          en: 'Which hardware platforms do you work on?',
        },
        answer: {
          fr: 'Nous développons sur processeurs ARM, sur ESP32 et sur Linux embarqué construit avec Yocto, principalement en Rust et en Kotlin.',
          en: 'We develop for ARM processors, ESP32 and embedded Linux built with Yocto, mainly in Rust and Kotlin.',
        },
      },
      {
        question: {
          fr: 'Pouvez-vous relier nos équipements à nos applications ?',
          en: 'Can you connect our equipment to our applications?',
        },
        answer: {
          fr: 'Oui. Nous relions vos équipements à votre système d’information pour collecter leurs données, les superviser en temps réel et les exploiter dans vos applications web.',
          en: 'Yes. We connect your equipment to your business systems to collect its data, monitor it in real time and use it in your web applications.',
        },
      },
      {
        question: {
          fr: 'Avez-vous des références dans l’embarqué ?',
          en: 'Do you have embedded references?',
        },
        answer: {
          fr: 'Oui : la communication et la supervision d’une nouvelle génération de compteurs électriques pour Enedis, et la supervision des terminaux de paiement d’Ingenico.',
          en: 'Yes: communication and monitoring software for a new generation of Enedis electricity meters, and payment terminal monitoring for Ingenico.',
        },
      },
    ],
  },
  'cloud-ai': {
    title: {
      fr: 'Cloud privé souverain et intégration de l’IA en entreprise',
      en: 'Sovereign Private Cloud & Enterprise AI Integration',
    },
    description: {
      fr: 'Cloud privé d’entreprise souverain hébergé dans l’UE, DevOps et intégration de l’IA : Swirl déploie vos applications et automatise leur mise en production.',
      en: 'A sovereign private enterprise cloud hosted in the EU, DevOps and AI integration: Swirl deploys your applications and automates their delivery to production.',
    },
    heading: {
      fr: 'Cloud privé souverain',
      en: 'Sovereign private cloud',
    },
    accent: { fr: 'et intégration de l’IA.', en: 'and AI integration.' },
    lead: {
      fr: 'Un cloud privé d’entreprise souverain, hébergé dans l’Union européenne, où vos applications sont déployées automatiquement. Swirl intègre aussi vos solutions d’intelligence artificielle et automatise leur mise en production.',
      en: 'A sovereign private enterprise cloud, hosted in the European Union, where your applications are deployed automatically. Swirl also integrates your artificial intelligence solutions and automates their delivery to production.',
    },
    capabilities: [
      {
        title: {
          fr: 'Cloud privé d’entreprise',
          en: 'Private enterprise cloud',
        },
        text: {
          fr: 'Une plateforme sur serveurs dédiés, hébergée dans l’Union européenne, pour garder la maîtrise de vos données et de vos applications.',
          en: 'A platform on dedicated servers, hosted in the European Union, so you keep control of your data and applications.',
        },
      },
      {
        title: {
          fr: 'DevOps et livraison continue',
          en: 'DevOps and continuous delivery',
        },
        text: {
          fr: 'Des pipelines CI/CD qui testent et déploient vos applications automatiquement, pour des mises à jour régulières et maîtrisées.',
          en: 'CI/CD pipelines that test and deploy your applications automatically, for regular, controlled releases.',
        },
      },
      {
        title: { fr: 'Intégration de l’IA', en: 'AI integration' },
        text: {
          fr: 'Des modèles de machine learning reliés à vos applications métier, avec des résultats exploitables et une exécution supervisée.',
          en: 'Machine learning models connected to your business applications, with usable results and monitored execution.',
        },
      },
      {
        title: { fr: 'Calcul intensif sur GPU', en: 'GPU computing' },
        text: {
          fr: 'La mise en production de vos traitements de machine learning, sur GPU lorsque vos modèles le demandent.',
          en: 'Production deployment for your machine learning workloads, on GPUs when your models need them.',
        },
      },
    ],
    steps: [
      {
        title: { fr: 'Évaluer', en: 'Assess' },
        text: {
          fr: 'Vos applications, vos données et vos exigences de sécurité.',
          en: 'Your applications, data and security requirements.',
        },
      },
      {
        title: { fr: 'Installer la plateforme', en: 'Set up the platform' },
        text: {
          fr: 'Un cloud privé sur serveurs dédiés, préparé pour vos environnements.',
          en: 'A private cloud on dedicated servers, prepared for your environments.',
        },
      },
      {
        title: { fr: 'Automatiser', en: 'Automate' },
        text: {
          fr: 'Des pipelines de livraison qui testent et déploient chaque évolution.',
          en: 'Delivery pipelines that test and deploy every change.',
        },
      },
      {
        title: { fr: 'Intégrer l’IA', en: 'Integrate AI' },
        text: {
          fr: 'Vos modèles reliés à vos applications, avec une exécution supervisée.',
          en: 'Your models connected to your applications, with monitored execution.',
        },
      },
    ],
    projects: ['cacib', 'bouygues', 'allianz', 'cdc'],
    faq: [
      {
        question: {
          fr: 'Où sont hébergées nos données ?',
          en: 'Where is our data hosted?',
        },
        answer: {
          fr: 'Dans l’Union européenne, sur des serveurs dédiés. Votre cloud privé est réservé à votre entreprise.',
          en: 'In the European Union, on dedicated servers. Your private cloud is reserved for your company.',
        },
      },
      {
        question: {
          fr: 'Pouvez-vous automatiser le déploiement de nos applications ?',
          en: 'Can you automate our application deployments?',
        },
        answer: {
          fr: 'Oui. Nous mettons en place des pipelines CI/CD qui testent et déploient vos applications, comme pour les livraisons de Caisse des Dépôts, Allianz Trade ou Bouygues Construction.',
          en: 'Yes. We set up CI/CD pipelines that test and deploy your applications, as we did for releases at Caisse des Dépôts, Allianz Trade and Bouygues Construction.',
        },
      },
      {
        question: {
          fr: 'Comment intégrez-vous l’IA à nos outils ?',
          en: 'How do you integrate AI into our tools?',
        },
        answer: {
          fr: 'Nous relions les résultats de vos modèles à vos applications métier et supervisons leur exécution, comme pour la plateforme de calcul XVA de Crédit Agricole CIB.',
          en: 'We connect your models’ outputs to your business applications and monitor their execution, as on Crédit Agricole CIB’s XVA calculation platform.',
        },
      },
    ],
  },
};

// Expertise linked from a case study, in homepage order.
export const projectServices = (id: Project['id']) =>
  (Object.keys(servicePages) as Service['id'][]).filter((service) =>
    servicePages[service].projects.includes(id),
  );
