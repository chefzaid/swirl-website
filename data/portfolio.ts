export type Lang = 'fr' | 'en';
export type Bilingual = { fr: string; en: string };
export const services = [
  {
    id: 'web',
    title: { fr: 'Applications Web & Mobile', en: 'Web & Mobile Apps' },
    text: {
      fr: 'Des interfaces aux systèmes distribués, construire des applications métier performantes, maintenables et utiles.',
      en: 'From user interfaces to distributed systems, build business applications that are fast, maintainable and useful.',
    },
    tags: ['UI/UX', 'Android · iOS', 'API · System Design'],
  },
  {
    id: 'embedded',
    title: { fr: 'Systèmes Embarqués & IoT', en: 'Embedded Systems & IoT' },
    text: {
      fr: 'Concevoir des logiciels embarqués, connecter les équipements et superviser leurs échanges avec le système d’information, du prototype à la production.',
      en: 'Build embedded software, connect devices and monitor their exchanges with business systems, from prototype to production.',
    },
    tags: ['Rust · Kotlin', 'ARM · ESP32', 'Linux · Yocto'],
  },
  {
    id: 'cloud-ai',
    title: { fr: 'Cloud & IA', en: 'Cloud & AI' },
    text: {
      fr: 'Déployer des systèmes distribués dans le cloud, intégrer les résultats de modèles d’IA et automatiser leur mise en production.',
      en: 'Deploy distributed systems in the cloud, integrate AI model outputs and automate delivery.',
    },
    tags: ['AWS · GCP', 'CI/CD · DevOps', 'Machine Learning · GPU'],
  },
];
export const fixedPriceService = {
  id: 'developpement-au-forfait',
  name: {
    fr: 'Développement logiciel sur mesure, au forfait',
    en: 'Custom software development at a fixed price',
  },
  description: {
    fr: 'De l’idée à la mise en production, Swirl IT développe vos logiciels sur mesure au forfait : des solutions fiables, performantes et pensées pour durer.',
    en: 'From idea to launch, Swirl IT develops tailored software at a fixed price: reliable, high-performing solutions built to last.',
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
      en: 'Make financial calculations usable and provide a clear view of how they are processed.',
    },
    detail: {
      fr: 'Une plateforme qui transforme les résultats de modèles d’intelligence artificielle en informations utiles aux décisions financières. Le projet couvre le suivi des calculs, l’optimisation de leur exécution et l’automatisation des mises à jour.',
      en: 'A platform that turns AI model outputs into data that supports financial decisions. The project covers calculation monitoring, processing improvements and automated software releases.',
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
      en: 'Connect and monitor a new generation of electricity meters for professional use.',
    },
    detail: {
      fr: 'Des fonctions embarquées pour faire communiquer les compteurs et suivre leur fonctionnement. Des simulations des composants constructeur à la mise en service, le projet accompagne le passage de la conception à l’exploitation.',
      en: 'Built-in functions that let meters communicate and make their operation visible. From simulating manufacturer components to production support, the project helps move the equipment from design into use.',
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
      en: 'Subscription journeys designed around 3 product families: life insurance, protection and retirement savings.',
    },
    detail: {
      fr: 'Un accompagnement des premiers prototypes aux parcours de souscription, avec une attention portée à la fluidité et à la sécurité des accès. Les problèmes de performance et de connexion sont traités pour simplifier l’expérience des utilisateurs.',
      en: 'Support from early prototypes through to subscription journeys, with a focus on smooth use and secure access. Performance and sign-in issues are addressed to make the experience easier for users.',
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
    detail: {
      fr: 'Deux outils complémentaires : un référentiel pour organiser l’information financière et un outil d’évaluation pour l’exploiter. Des interfaces dédiées et des accès adaptés aux rôles rendent ces informations accessibles pour éclairer les décisions de financement.',
      en: 'Two complementary tools: a reference system that organises financial information and a scoring tool that helps put it to use. Dedicated interfaces and role-based access make this information available to support financing decisions.',
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
      en: 'Modernize the tools behind credit insurance offers, contracts and financial flows.',
    },
    detail: {
      fr: 'Des offres commerciales au suivi des contrats et des flux financiers, les outils de l’assurance-crédit évoluent dans un contexte international. La modernisation des fonctions existantes et l’automatisation des mises à jour facilitent leur évolution au fil des besoins métier.',
      en: 'From commercial offers to contracts and financial flows, credit insurance tools evolve in an international setting. Modernized features and automated software releases help the platform keep pace with changing business needs.',
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
      en: 'Bring 3 essential services into one portal: transfers, online loans and secure messaging.',
    },
    detail: {
      fr: 'L’évolution du portail de la Banque des Territoires permet d’accompagner les démarches bancaires en ligne. Le projet relie les services entre eux et automatise les livraisons pour faire évoluer les parcours de virement, de prêt et d’échange avec la banque.',
      en: 'Development of the Banque des Territoires portal supports everyday banking online. The project connects services and automates releases so transfer, loan and secure messaging journeys can continue to evolve.',
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
      en: 'Track construction progress, contracts, risks and documents with tools built around the needs of construction sites.',
    },
    detail: {
      fr: 'Des applications métier au service du suivi des chantiers et de leurs documents. Les interfaces et les fonctions existantes évoluent, tandis que les livraisons sont coordonnées et automatisées pour accompagner les besoins du terrain.',
      en: 'Business applications that support construction-site tracking and documentation. Interfaces and existing features evolve, with coordinated and automated releases to support the needs of construction sites.',
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
      en: 'Enable PIN delivery by SMS with strong authentication and dedicated protection for sensitive data.',
    },
    detail: {
      fr: 'Un parcours qui associe contrôles de sécurité et envoi par SMS. L’intégration des services de messagerie et l’automatisation des tests accompagnent la mise en œuvre de cette solution d’envoi sécurisé.',
      en: 'A workflow that combines security checks with SMS delivery. Messaging-service integration and automated tests support the implementation of this secure delivery solution.',
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
      en: 'Bring payment terminal monitoring and administration together in one control point.',
    },
    detail: {
      fr: 'Une solution de supervision des terminaux, accompagnée d’une interface d’administration repensée. Le projet couvre les nouvelles fonctions, leur validation par des prototypes et la préparation de leur déploiement.',
      en: 'A terminal-monitoring solution with a redesigned administration interface. The project covers new features, prototype validation and preparation for deployment.',
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
      en: 'Electricity and gas: estimate a tariff, subscribe and manage a contract through one portal.',
    },
    detail: {
      fr: 'Trois démarches clés — simuler, souscrire, gérer — réunies pour l’électricité et le gaz dans une expérience adaptée au profil de l’abonné. Le portail relie les services existants pour accompagner le client de la découverte d’une offre au suivi de son contrat.',
      en: 'Three key tasks — estimate, subscribe, manage — brought together for electricity and gas in an experience tailored to each subscriber. The portal connects existing services to support customers from exploring an offer through to managing their contract.',
    },
    tags: {
      fr: ['Portail client', 'Souscription en ligne', 'Personnalisation'],
      en: ['Customer portal', 'Online subscriptions', 'Personalization'],
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
