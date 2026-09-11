export type Lang = 'fr' | 'en';
export type Bilingual = { fr: string; en: string };
export const services = [
  {
    id: 'web',
    title: { fr: 'Applications web et mobiles', en: 'Web & Mobile Apps' },
    text: {
      fr: 'Vos applications web et mobiles sur mesure, conçues pour vos usages métier. Des interfaces intuitives, rapides et accessibles. Des API robustes pour connecter vos outils et vos données. Nous vous accompagnons de la conception à la mise en production.',
      en: 'Tailored web and mobile applications built around your business needs. Intuitive, fast, and accessible interfaces. Robust APIs connecting your tools and data. We support you from design to production.',
    },
    tags: ['UI/UX', 'Android · iOS', 'API · System Design'],
  },
  {
    id: 'embedded',
    title: { fr: 'Systèmes embarqués & IoT', en: 'Embedded Systems & IoT' },
    text: {
      fr: 'Vos logiciels embarqués et objets connectés, du prototype à la production. Des équipements reliés à votre système d’information. Des données collectées et supervisées en temps réel. Nous développons des solutions fiables, adaptées aux contraintes de votre matériel.',
      en: 'Your embedded software and connected devices, from prototype to production. Equipment linked to your business systems. Data collected and monitored in real time. We build reliable solutions tailored to your hardware constraints.',
    },
    tags: ['Rust · Kotlin', 'ARM · ESP32', 'Linux · Yocto'],
  },
  {
    id: 'cloud-ai',
    title: { fr: 'Cloud & IA', en: 'Cloud & AI' },
    text: {
      fr: 'Votre cloud privé d’entreprise souverain, hébergé dans l’UE, opérationnel en quelques heures. Vos applications déployées instantanément. Nous intégrons également vos solutions d’IA et automatisons leur mise en production.',
      en: 'Your sovereign private enterprise cloud, hosted in the EU, ready within hours. Your applications deployed instantly. We also integrate your AI solutions and automate delivery.',
    },
    tags: ['Dedicated Servers', 'CI/CD · DevOps', 'Machine Learning · GPU'],
  },
];
export const applicationService = {
  id: 'applications-sur-mesure',
  name: {
    fr: 'Applications sur mesure',
    en: 'Tailored applications',
  },
  description: {
    fr: 'De l’idée à la mise en production, Swirl développe vos applications sur mesure et les héberge dans un cloud privé. Des solutions fiables, performantes et pensées pour durer.',
    en: 'From idea to launch, Swirl builds tailored applications and hosts them in a private cloud. Reliable, high-performing solutions built to last.',
  },
};
export const projects = [
  {
    id: 'cacib',
    client: 'Crédit Agricole CIB',
    sector: 'finance',
    date: '2025 — 2026',
    title: {
      fr: 'Transformer les calculs en décisions.',
      en: 'Turning calculations into decisions.',
    },
    text: {
      fr: 'Rendre les résultats de calcul financier exploitables et offrir une vue claire de leur traitement.',
      en: 'Make financial calculation results usable and provide a clear view of how they are processed.',
    },
    caseStudy: {
      need: {
        fr: 'Rendre les résultats de modèles d’IA exploitables pour les décisions financières, tout en gardant une vue claire sur l’exécution des calculs.',
        en: 'Make AI model outputs useful for financial decisions while keeping calculation processing visible and manageable.',
      },
      contribution: {
        fr: 'Intégration des résultats de modèles, supervision des traitements et optimisation de l’exécution des calculs. Automatisation des mises à jour pour accompagner l’évolution de la plateforme.',
        en: 'Integrated model outputs, monitored processing, and worked on calculation performance. Automated software releases to support ongoing platform development.',
      },
      solution: {
        fr: 'Une plateforme qui relie les résultats de calcul à leur suivi opérationnel. Les travaux portent sur la performance des traitements, la visibilité de leur exécution et la régularité des livraisons.',
        en: 'A platform connecting financial calculation results with operational monitoring. The work focuses on processing performance, execution visibility, and repeatable software delivery.',
      },
    },
    tags: {
      fr: ['Intelligence artificielle', 'Calcul financier', 'Supervision'],
      en: ['Artificial intelligence', 'Financial computing', 'Monitoring'],
    },
    color: 'green',
  },
  {
    id: 'enedis',
    client: 'Enedis',
    sector: 'energy',
    date: '2024 — 2025',
    title: {
      fr: 'Des compteurs qui communiquent.',
      en: 'Connecting the next generation of meters.',
    },
    text: {
      fr: 'Connecter et superviser une nouvelle génération de compteurs pour accompagner les usages électriques professionnels.',
      en: 'Connect and monitor a new generation of electricity meters for business use.',
    },
    caseStudy: {
      need: {
        fr: 'Faire communiquer et superviser une nouvelle génération de compteurs électriques destinés aux usages professionnels, dans les contraintes du matériel embarqué.',
        en: 'Connect and monitor a new generation of electricity meters for business use within the constraints of embedded hardware.',
      },
      contribution: {
        fr: 'Développement de logiciels embarqués pour la communication et la supervision des compteurs. Simulation des composants constructeur et accompagnement de la conception à la mise en service.',
        en: 'Developed embedded software for meter communication and monitoring. Simulated manufacturer components and supported the transition from design to deployment.',
      },
      solution: {
        fr: 'Des fonctions de communication et de supervision intégrées aux compteurs, avec un travail de simulation pour préparer leur fonctionnement sur le matériel cible.',
        en: 'Communication and monitoring capabilities integrated into the meters, supported by component simulations that prepare the software for its target hardware.',
      },
    },
    tags: {
      fr: ['Objets connectés', 'Systèmes embarqués', 'Supervision'],
      en: ['Connected devices', 'Embedded systems', 'Monitoring'],
    },
    color: 'blue',
  },
  {
    id: 'bpce',
    client: 'BPCE / Natixis',
    sector: 'finance',
    date: '2022 — 2024',
    title: {
      fr: 'L’assurance, avec moins d’obstacles.',
      en: 'Taking friction out of insurance.',
    },
    text: {
      fr: 'Des parcours de souscription conçus pour faciliter l’accès à 3 familles de produits : assurance-vie, prévoyance et épargne retraite.',
      en: 'Insurance application journeys covering 3 product families: life insurance, protection, and retirement savings.',
    },
    caseStudy: {
      need: {
        fr: 'Faciliter la souscription à trois familles de produits — assurance-vie, prévoyance et épargne retraite — avec des parcours fluides et des accès sécurisés.',
        en: 'Simplify insurance application journeys across three product families: life insurance, protection, and retirement savings, with smooth navigation and secure access.',
      },
      contribution: {
        fr: 'Accompagnement des premiers prototypes aux parcours de souscription. Traitement des problèmes de performance et de connexion, avec une attention portée à la fluidité des interactions et à la sécurité des accès.',
        en: 'Supported the project from early prototypes to insurance application journeys. Addressed performance and sign-in issues, with a focus on responsive interactions and secure access.',
      },
      solution: {
        fr: 'Des parcours couvrant trois familles de produits, avec des améliorations ciblées sur les performances et la connexion des utilisateurs. Une même démarche de qualité appliquée aux différentes étapes de souscription.',
        en: 'Application journeys covering three product families, with targeted work on performance and sign-in reliability. The same focus on usability and access security extends across the application process.',
      },
    },
    tags: {
      fr: ['Parcours client', 'Sécurité des accès', 'Applications web'],
      en: ['Customer journeys', 'Access security', 'Web applications'],
    },
    color: 'purple',
  },
  {
    id: 'sg',
    client: 'Société Générale',
    sector: 'finance',
    date: '2020 — 2022',
    title: {
      fr: 'Mieux voir pour mieux financer.',
      en: 'Clearer data for financing decisions.',
    },
    text: {
      fr: 'Associer les données financières et les outils d’évaluation pour éclairer les décisions de financement de factures.',
      en: 'Bring financial data and assessment tools together to support invoice-financing decisions.',
    },
    caseStudy: {
      need: {
        fr: 'Rapprocher les données financières et les outils d’évaluation pour accompagner les décisions de financement de factures.',
        en: 'Bring financial data and assessment tools together to support invoice financing decisions.',
      },
      contribution: {
        fr: 'Intervention sur deux outils complémentaires : un référentiel de données financières et un outil de scoring. Développement d’interfaces dédiées et gestion des accès selon les rôles des utilisateurs.',
        en: 'Worked on two complementary tools: a financial data repository and a scoring application. Developed dedicated interfaces and access controls based on user roles.',
      },
      solution: {
        fr: 'Deux outils qui organisent l’information et la rendent exploitable pour l’évaluation financière, avec des accès adaptés aux responsabilités de chaque utilisateur.',
        en: 'Two tools that organize financial information and make it usable for assessment, with access tailored to each user’s responsibilities.',
      },
    },
    tags: {
      fr: ['Données financières', 'Aide à la décision', 'Gestion des accès'],
      en: ['Financial data', 'Decision support', 'Access management'],
    },
    color: 'red',
  },
  {
    id: 'allianz',
    client: 'Allianz Trade',
    sector: 'finance',
    date: '2019 — 2020',
    title: {
      fr: 'Faire avancer l’assurance-crédit.',
      en: 'Moving credit insurance forward.',
    },
    text: {
      fr: 'Moderniser les outils qui accompagnent les offres commerciales, les contrats et les flux financiers de l’assurance-crédit.',
      en: 'Modernize the tools behind credit insurance offers, contracts, and financial flows.',
    },
    caseStudy: {
      need: {
        fr: 'Faire évoluer les outils de l’assurance-crédit qui accompagnent les offres commerciales, les contrats et les flux financiers dans un contexte international.',
        en: 'Evolve credit insurance tools supporting commercial offers, contracts, and financial flows across an international business.',
      },
      contribution: {
        fr: 'Modernisation des fonctionnalités existantes et automatisation des mises à jour. Accompagnement des évolutions métier sur les différentes étapes de gestion de l’assurance-crédit.',
        en: 'Modernized existing features and automated software releases. Supported changing business requirements across credit insurance management workflows.',
      },
      solution: {
        fr: 'Des outils modernisés et un processus de livraison automatisé pour accompagner les évolutions des offres, des contrats et des opérations financières.',
        en: 'Modernized tools and an automated release process supporting changes to offers, contracts, and financial operations.',
      },
    },
    tags: {
      fr: ['Applications métier', 'Modernisation', 'Automatisation'],
      en: ['Business applications', 'Modernization', 'Automation'],
    },
    color: 'blue',
  },
  {
    id: 'cdc',
    client: 'Caisse des Dépôts',
    sector: 'finance',
    date: '2018 — 2019',
    title: {
      fr: 'La banque à portée de clic.',
      en: 'Banking within easy reach.',
    },
    text: {
      fr: 'Réunir 3 services essentiels dans un portail : virements, prêts en ligne et messagerie sécurisée.',
      en: 'Bring 3 essential services into one portal: transfers, online loans, and secure messaging.',
    },
    caseStudy: {
      need: {
        fr: 'Réunir les virements, les prêts en ligne et la messagerie sécurisée dans le portail de la Banque des Territoires.',
        en: 'Bring transfers, online loans, and secure messaging together in the Banque des Territoires banking portal.',
      },
      contribution: {
        fr: 'Évolution des parcours bancaires et intégration des services qui les composent. Automatisation des livraisons pour accompagner les mises à jour du portail.',
        en: 'Developed banking workflows and integrated their supporting services. Automated software releases to support ongoing portal updates.',
      },
      solution: {
        fr: 'Trois services bancaires accessibles depuis un même portail, avec des livraisons automatisées pour faire évoluer les parcours de virement, de prêt et de messagerie.',
        en: 'Three banking services accessible through one portal, with automated releases supporting updates to transfer, loan, and messaging workflows.',
      },
    },
    tags: {
      fr: ['Banque en ligne', 'Dématérialisation', 'Parcours client'],
      en: ['Online banking', 'Digital services', 'Customer journeys'],
    },
    color: 'red',
  },
  {
    id: 'bouygues',
    client: 'Bouygues Construction',
    sector: 'industry',
    date: '2016 — 2018',
    title: {
      fr: 'Garder le cap sur chaque chantier.',
      en: 'Keeping construction projects on track.',
    },
    text: {
      fr: 'Suivre l’avancement des chantiers, les contrats, les risques et les documents : des outils pensés pour les besoins du terrain.',
      en: 'Track construction progress, contracts, risks, and documents with tools built around the needs of construction sites.',
    },
    caseStudy: {
      need: {
        fr: 'Donner aux utilisateurs sur le terrain des outils pour suivre l’avancement des chantiers, les contrats, les risques et les documents associés.',
        en: 'Give on-site users tools to track construction progress, contracts, risks, and related documents.',
      },
      contribution: {
        fr: 'Évolution des interfaces et des fonctionnalités des applications métier. Coordination et automatisation des livraisons pour accompagner les besoins du suivi de chantier et de la gestion documentaire.',
        en: 'Updated interfaces and features across business applications. Coordinated and automated releases to support construction tracking and document management needs.',
      },
      solution: {
        fr: 'Des applications adaptées au suivi des chantiers et de leurs documents, avec un processus de livraison coordonné pour accompagner les évolutions fonctionnelles.',
        en: 'Applications supporting construction tracking and documentation, with a coordinated release process for ongoing feature development.',
      },
    },
    tags: {
      fr: ['Suivi de chantier', 'Gestion documentaire', 'Applications métier'],
      en: [
        'Construction tracking',
        'Document management',
        'Business applications',
      ],
    },
    color: 'orange',
  },
  {
    id: 'idemia',
    client: 'IDEMIA',
    sector: 'industry',
    date: '2015 — 2016',
    title: {
      fr: 'Un code confidentiel, un envoi protégé.',
      en: 'A private code, delivered securely.',
    },
    text: {
      fr: 'Permettre l’envoi de codes PIN par SMS avec une authentification renforcée et une protection dédiée aux données sensibles.',
      en: 'Enable PIN delivery by SMS with strong authentication and protections for sensitive data.',
    },
    caseStudy: {
      need: {
        fr: 'Permettre l’envoi de codes PIN par SMS en intégrant des contrôles d’authentification et une protection adaptée aux données sensibles.',
        en: 'Enable PIN delivery by SMS with authentication checks and protections for sensitive data.',
      },
      contribution: {
        fr: 'Intégration des services de messagerie dans un parcours associant contrôles de sécurité et envoi des codes. Automatisation des tests pour accompagner la validation de la solution.',
        en: 'Integrated messaging services into a workflow combining security checks and code delivery. Automated tests to support validation of the solution.',
      },
      solution: {
        fr: 'Un parcours d’envoi de codes PIN par SMS qui associe authentification, intégration des services de messagerie et tests automatisés.',
        en: 'A PIN delivery workflow combining authentication, SMS service integration, and automated tests.',
      },
    },
    tags: {
      fr: ['Cybersécurité', 'Authentification', 'Messagerie'],
      en: ['Cybersecurity', 'Authentication', 'Messaging'],
    },
    color: 'purple',
  },
  {
    id: 'ingenico',
    client: 'Ingenico',
    sector: 'industry',
    date: '2015',
    title: {
      fr: 'Garder un œil sur les terminaux de paiement.',
      en: 'Keeping payment terminals in view.',
    },
    text: {
      fr: 'Réunir la supervision et l’administration des terminaux de paiement dans un même point de contrôle.',
      en: 'Bring payment terminal monitoring and administration together in one place.',
    },
    caseStudy: {
      need: {
        fr: 'Réunir la supervision et l’administration des terminaux de paiement dans un même point de contrôle.',
        en: 'Bring payment terminal monitoring and administration together in one place.',
      },
      contribution: {
        fr: 'Développement de fonctions de supervision et refonte de l’interface d’administration. Validation des nouvelles fonctionnalités par des prototypes et préparation de leur déploiement.',
        en: 'Developed monitoring capabilities and redesigned the administration interface. Validated new features through prototypes and prepared them for deployment.',
      },
      solution: {
        fr: 'Une solution de supervision accompagnée d’une interface d’administration repensée, avec des fonctionnalités validées par prototypage avant leur déploiement.',
        en: 'A monitoring solution with a redesigned administration interface and features validated through prototyping before deployment.',
      },
    },
    tags: {
      fr: ['Paiement', 'Supervision', 'Administration web'],
      en: ['Payments', 'Monitoring', 'Web administration'],
    },
    color: 'blue',
  },
  {
    id: 'engie',
    client: 'ENGIE',
    sector: 'energy',
    date: '2013 — 2015',
    title: {
      fr: 'L’énergie, plus simple au quotidien.',
      en: 'Making everyday energy easier.',
    },
    text: {
      fr: 'Électricité et gaz : simuler un tarif, souscrire et gérer son contrat depuis un même portail.',
      en: 'Electricity and gas: estimate a rate, sign up, and manage your contract through one portal.',
    },
    caseStudy: {
      need: {
        fr: 'Permettre aux clients d’estimer un tarif, de souscrire et de gérer leur contrat d’électricité ou de gaz depuis un même portail.',
        en: 'Let customers estimate a rate, sign up, and manage their electricity or gas contract through one portal.',
      },
      contribution: {
        fr: 'Intégration des services existants et adaptation des parcours au profil de l’abonné. Accompagnement des trois démarches clés : simulation, souscription et gestion du contrat.',
        en: 'Integrated existing services and adapted workflows to customer profiles. Supported three key tasks: rate estimates, sign-up, and contract management.',
      },
      solution: {
        fr: 'Trois démarches réunies pour deux offres d’énergie — électricité et gaz — dans un portail qui accompagne le client de la découverte d’une offre au suivi de son contrat.',
        en: 'Three customer tasks covering electricity and gas in a single portal, from exploring an offer to managing an active contract.',
      },
    },
    tags: {
      fr: ['Portail client', 'Souscription en ligne', 'Personnalisation'],
      en: ['Customer portal', 'Online sign-up', 'Personalization'],
    },
    color: 'green',
  },
] as const;
export type Project = (typeof projects)[number];
export const partners = [
  'Capgemini',
  'Akka Technologies',
  'Niji',
  'Consult IT',
  'Inetum',
  'CodeWorks',
  'Lukla Group',
  'Ossia Conseil',
  'Werin Group',
];
