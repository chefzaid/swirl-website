---
title: 'Cyber Resilience Act : ce que doivent faire éditeurs et fabricants'
description: 'Le Cyber Resilience Act pour les logiciels et produits connectés : qui est concerné, le signalement des vulnérabilités dû depuis septembre 2026 et les exigences de 2027.'
heading: 'Cyber Resilience Act : ce que les fabricants de logiciels et de produits connectés doivent préparer'
lead: 'Depuis le 11 septembre 2026, les fabricants doivent signaler en 24 heures les vulnérabilités activement exploitées de leurs produits. Au 11 décembre 2027, tout produit comportant des éléments numériques vendu dans l’UE devra respecter les exigences de sécurité du règlement et porter pour elles le marquage CE. Voici ce que cela recouvre et comment s’y préparer.'
published: 2026-10-23
updated: 2026-10-23
sources:
  - label: 'Règlement (UE) 2024/2847 (Cyber Resilience Act), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2024/2847/oj'
  - label: 'Commission européenne : obligations de signalement du CRA'
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cra-reporting'
  - label: 'ENISA : lancement de la plateforme unique de signalement du CRA'
    url: 'https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched'
  - label: 'Règlement d’exécution (UE) 2025/2392 : catégories de produits importants et critiques, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg_impl/2025/2392/oj'
  - label: 'Commission européenne : le CRA et l’open source'
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cra-open-source'
  - label: 'ANSSI : le Cyber Resilience Act'
    url: 'https://cyber.gouv.fr/reglementation/cybersecurite-des-produits/cyber-resilience-act/'
---

## Le Cyber Resilience Act en bref

Le Cyber Resilience Act (CRA), règlement (UE) 2024/2847, fixe des règles de sécurité pour les produits comportant des éléments numériques mis sur le marché de l’UE. Entré en vigueur le 10 décembre 2024, il s’applique en trois temps :

- **11 juin 2026 :** règles applicables aux organismes qui évalueront la conformité ;
- **11 septembre 2026 :** les fabricants doivent signaler les vulnérabilités activement exploitées et les incidents graves (article 14) ;
- **11 décembre 2027 :** tout le reste, dont les exigences de sécurité, la période d’assistance et le marquage CE.

Comme tout règlement, il s’applique directement dans chaque État membre. En France, le CERT-FR (ANSSI) reçoit les signalements et l’ANFR surveille le marché.

## 1. Vérifiez si vos produits sont concernés

Un produit comportant des éléments numériques est un logiciel ou un matériel qui se connecte, directement ou indirectement, à un appareil ou à un réseau, avec ses solutions de traitement de données à distance. Cela couvre un capteur connecté et son micrologiciel, une application de bureau ou mobile, un automate industriel, un routeur ou une bibliothèque logicielle vendue seule.

- **Le traitement à distance** est inclus lorsque le fabricant l’a conçu, ou fait concevoir, et que le produit ne peut assurer l’une de ses fonctions sans lui : le service en ligne d’un objet connecté, par exemple. Les services cloud conçus indépendamment d’un produit, comme le SaaS, relèvent d’autres règles telles que NIS2.
- **Exclus :** les produits déjà couverts par leurs propres règles, comme les dispositifs médicaux, les véhicules à moteur, les produits aéronautiques certifiés et les équipements marins.
- **Open source :** les logiciels libres ne sont concernés que s’ils sont fournis dans le cadre d’une activité commerciale. Les fondations et autres « gestionnaires de logiciels open source » qui soutiennent ces logiciels suivent un régime allégé.

Le fabricant porte l’essentiel des obligations, qu’il fabrique le produit ou le fasse fabriquer et le vende sous son nom. Importateurs et distributeurs doivent vérifier la conformité des produits qu’ils vendent.

## 2. Signalez dès maintenant les vulnérabilités exploitées

Depuis le 11 septembre 2026, un fabricant qui a connaissance d’une vulnérabilité activement exploitée dans son produit, ou d’un incident grave affectant sa sécurité, doit la signaler :

- une **alerte précoce sous 24 heures** ;
- une **notification sous 72 heures**, avec ce que l’on sait et les mesures prises ;
- un **rapport final** dans les 14 jours suivant la disponibilité d’un correctif ou d’une mesure d’atténuation pour une vulnérabilité, ou dans le mois suivant la notification pour un incident.

Les signalements passent par la plateforme unique de signalement de l’ENISA, ouverte le 11 septembre 2026, vers le CSIRT du pays de l’établissement principal du fabricant : le CERT-FR pour une entreprise établie en France. L’obligation vaut pour les produits déjà sur le marché, pas seulement les nouveaux. Les utilisateurs doivent aussi être informés, pour pouvoir se protéger.

Décidez dès maintenant qui surveille l’exploitation de vos produits, qui peut déposer un signalement dans la journée et qui dispose d’un compte EU Login pour la plateforme.

## 3. Intégrez les exigences de sécurité d’ici décembre 2027

L’annexe I énumère ce que tout produit doit respecter. Entre autres, un produit doit :

- être mis sur le marché **sans vulnérabilité exploitable connue** ;
- être livré avec une **configuration sécurisée par défaut**, et un moyen de revenir à son état d’origine ;
- protéger les données par un contrôle d’accès et un chiffrement appropriés, et n’exposer que le nécessaire ;
- recevoir des **mises à jour de sécurité**, installées automatiquement par défaut quand c’est pertinent, avec la possibilité de s’y soustraire.

La gestion des vulnérabilités est une exigence à part entière. Le fabricant doit :

- tenir une **nomenclature logicielle (SBOM)** dans un format courant et lisible par machine, couvrant au moins les dépendances de premier niveau ;
- corriger les vulnérabilités sans délai et publier des informations sur celles qui sont corrigées ;
- appliquer une **politique de divulgation coordonnée des vulnérabilités**, avec une adresse de contact où chacun peut en signaler une ;
- tester régulièrement la sécurité du produit.

## 4. Fixez et annoncez une période d’assistance

Pendant la période d’assistance, le fabricant traite les vulnérabilités et fournit les mises à jour de sécurité. Elle doit refléter la durée d’utilisation attendue du produit et durer au moins cinq ans, sauf si le produit est destiné à servir moins longtemps. Chaque mise à jour de sécurité doit ensuite rester disponible au moins dix ans après sa publication, ou jusqu’à la fin de la période d’assistance si elle est plus tardive. Indiquez la période d’assistance là où le client la voit avant d’acheter.

## 5. Connaissez la catégorie de votre produit

La plupart des produits relèvent de la catégorie par défaut : le fabricant évalue lui-même leur conformité. Deux listes, précisées par le règlement d’exécution (UE) 2025/2392, demandent davantage :

- **Produits importants, classe I** (annexe III) : par exemple les systèmes d’exploitation, routeurs et modems, microcontrôleurs dotés de fonctions de sécurité, VPN et gestionnaires de mots de passe. L’autoévaluation n’est permise que si des normes harmonisées ou une certification sont pleinement appliquées ; sinon un organisme notifié intervient.
- **Produits importants, classe II :** par exemple les hyperviseurs et environnements d’exécution de conteneurs, pare-feu et systèmes de détection d’intrusion. Un organisme notifié intervient toujours.
- **Produits critiques** (annexe IV) : les boîtiers matériels de sécurité, passerelles de compteurs intelligents, cartes à puce et éléments sécurisés.

Les normes harmonisées sont en cours de rédaction par le CEN, le CENELEC et l’ETSI à la demande de la Commission depuis 2025. Les exigences s’appliquent même avant leur publication.

## 6. Préparez la documentation et le marquage CE

Avant de mettre un produit sur le marché à partir de décembre 2027, le fabricant établit la documentation technique, signe une déclaration UE de conformité et appose le marquage CE ; pour un logiciel, il peut figurer sur la déclaration ou sur le site du produit. Conservez la documentation et la déclaration au moins dix ans après la mise sur le marché, ou pendant la période d’assistance si elle est plus longue.

## Les enjeux

Les amendes peuvent atteindre 15 millions d’euros ou 2,5 % du chiffre d’affaires annuel mondial, le montant le plus élevé étant retenu, en cas de manquement aux exigences de sécurité ou aux obligations du fabricant, signalement compris. Les micro et petites entreprises ne sont pas sanctionnées pour le seul non-respect du délai de 24 heures de l’alerte précoce. Les autorités de surveillance du marché peuvent aussi exiger la mise en conformité ou le retrait d’un produit.

## La liste de contrôle

- La liste de vos produits comportant des éléments numériques, avec leur catégorie et leur traitement à distance.
- Une équipe désignée et une procédure pour signaler en 24 heures, avec un compte sur la plateforme de l’ENISA.
- Une SBOM produite à chaque version.
- Une politique de divulgation des vulnérabilités publiée et une adresse de contact.
- Des mises à jour de sécurité que vous savez livrer, automatiquement quand c’est pertinent.
- Une période d’assistance décidée et affichée avant l’achat.
- La documentation technique, la déclaration de conformité et le marquage CE au 11 décembre 2027.

## La place de Swirl

Swirl conçoit des logiciels embarqués et des objets connectés, principalement en Rust et en Kotlin sur processeurs ARM, ESP32 et Linux embarqué construit avec Yocto, et définit la sécurité avec le matériel et la connectivité dès le premier jour : configuration sécurisée, mises à jour et SBOM peuvent ainsi être conçues d’emblée plutôt qu’ajoutées avant la sortie. Voir [nos réalisations embarquées et IoT](/logiciel-embarque-iot/). Pour les logiciels et services que vous exploitez sur Swirl Cloud, les images en fonctionnement sont analysées en continu et chaque vulnérabilité est suivie avec une échéance : 15 jours pour une critique, 30 pour une élevée. La période d’assistance, la politique de divulgation et les signalements au CERT-FR restent du ressort du fabricant. Voir [les contrôles et leurs preuves](/swirl-cloud/securite-conformite/).
