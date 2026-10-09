---
title: 'Quitter un hyperscaler : un plan de sortie concret'
description: 'Quitter un hyperscaler étape par étape : vos droits avec le Data Act, l’inventaire, les équivalents portables, le dimensionnement, la migration et la bascule.'
heading: 'Quitter un hyperscaler : un plan de sortie concret'
lead: 'Factures à l’usage, dépendance à un seul fournisseur, questions de juridiction : de plus en plus d’entreprises ramènent leurs applications sur des serveurs qu’elles choisissent. Le règlement européen sur les données fait désormais du changement de fournisseur un droit. Ce plan vous mène de l’inventaire à la bascule.'
published: 2026-10-09
updated: 2026-10-09
sources:
  - label: 'Règlement (UE) 2023/2854 (Data Act), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2023/2854/oj'
  - label: 'Commission européenne : la loi sur les données'
    url: 'https://digital-strategy.ec.europa.eu/fr/policies/data-act'
---

## Ce que change le Data Act

Depuis le 12 septembre 2025, le règlement sur les données (Data Act), (UE) 2023/2854, donne aux clients de services cloud le droit de passer à un autre fournisseur ou à leur propre infrastructure. Son article 25 fixe le cadre :

- le fournisseur peut exiger **au plus deux mois de préavis** avant le début du changement ;
- le changement doit ensuite aboutir dans une **période de transition de 30 jours civils**, que le fournisseur peut porter à sept mois au plus s’il démontre qu’un délai plus court est techniquement impossible ;
- vous gardez **au moins 30 jours** pour récupérer vos données après la transition ;
- jusqu’au 12 janvier 2027, le fournisseur ne peut facturer le changement, transfert de données compris, qu’à son coût direct ; **à partir du 12 janvier 2027, les frais de changement sont interdits**.

Les pénalités de résiliation anticipée prévues au contrat ne sont pas concernées par cette interdiction : vérifiez vos engagements. En 2024, les plus grands fournisseurs ont aussi annoncé renoncer aux frais de transfert de données pour les clients qui partent, sous conditions, par exemple terminer la migration dans un délai fixé ; vérifiez les conditions en vigueur chez le vôtre avant de commencer.

## 1. Inventorier ce qui tourne

Listez chaque service utilisé, par type : machines virtuelles et conteneurs, fonctions serverless, bases de données gérées, stockage objet, files et flux de messages, identité, CI/CD, supervision et journaux, DNS et diffusion de contenu. Pour chacun, notez le volume de données et sa croissance, ce qui en dépend, et tout engagement de capacité réservée avec sa date de fin. Votre facture détaillée par service est un bon point de départ.

## 2. Trouver un équivalent portable à chaque service

La plupart des services gérés ont un équivalent ouvert et standard :

- **Conteneurs et Kubernetes géré :** Kubernetes, avec les mêmes images et les mêmes manifestes.
- **PostgreSQL ou MySQL gérés :** le même moteur de base de données, migré par sauvegarde et restauration ou par réplication.
- **Stockage objet :** un service compatible S3, que la plupart des outils savent déjà utiliser.
- **Files et flux de messages :** Kafka ou Redis.
- **Identité :** un fournisseur OpenID Connect et SAML comme Keycloak.
- **CI/CD et registre d’images :** GitLab CI et un registre OCI.
- **Supervision et journaux :** Prometheus, Grafana et Elasticsearch ou OpenSearch.

Les fonctions serverless et les bases de données propriétaires demandent en général une réécriture. Estimez-les en premier : ce sont elles qui fixent la durée du projet.

## 3. Dimensionner la cible à partir de mesures

Mesurez ce que vous consommez réellement pendant plusieurs semaines, pics compris : processeur, mémoire, stockage et sa croissance, trafic réseau. Dimensionnez les serveurs à partir de ces chiffres, avec de la marge, et prévoyez la perte d’un serveur : soit les autres absorbent sa charge, soit vous acceptez et documentez l’interruption. Des serveurs à prix fixe rendent la facture prévisible, à condition d’être bien dimensionnés.

## 4. Répéter la migration des données

Copiez les données, vérifiez-les par des comptages et des sommes de contrôle, et chronométrez la copie. Pour les bases qui ne peuvent pas s’arrêter, utilisez la réplication et gardez la cible synchronisée jusqu’à la bascule. Répétez la séquence complète au moins une fois sur une copie : la vraie migration ne réservera pas de surprise et vous connaîtrez la durée du gel final.

## 5. Basculer en gardant une porte de sortie

Réduisez la durée de vie (TTL) des enregistrements DNS quelques jours avant. Faites tourner la nouvelle plateforme à côté de l’ancienne, basculez le trafic, et suivez les erreurs et les temps de réponse selon des critères fixés à l’avance. Gardez l’ancien environnement intact et en lecture seule tant que vous n’êtes pas confiant, puis exportez ce qui reste, supprimez-le et fermez le compte ou demandez la renonciation aux frais de sortie du fournisseur.

## 6. Mettre à jour vos registres

Une migration change le lieu de traitement des données. Mettez à jour votre registre des traitements RGPD, la liste de vos sous-traitants, vos accords de traitement des données et vos réponses aux questionnaires de sécurité. Les entités financières et leurs prestataires TIC mettent aussi à jour leur registre d’informations DORA.

## La checklist de sortie

- Préavis, engagements et conditions de résiliation anticipée vérifiés dans votre contrat.
- Inventaire des services, des volumes de données et des dépendances.
- Un équivalent portable, ou une estimation de réécriture, pour chaque service géré.
- Une cible dimensionnée sur plusieurs semaines de mesures, avec la perte d’un serveur prévue.
- Une migration des données répétée, avec sa durée mesurée.
- DNS prêt, critères de bascule fixés, retour arrière possible.
- Registres, contrats et questionnaires à jour.

## La place de Swirl Cloud

Swirl Cloud réunit la plupart de ces équivalents dans une seule installation, sur les serveurs que vous choisissez : Kubernetes avec GitLab CI, un registre et Argo CD ; PostgreSQL, MongoDB, Redis et Kafka ; l’authentification unique Keycloak ; Prometheus, Grafana et Elasticsearch. Chaque serveur a un coût mensuel fixe, réparti par environnement et par application, et le suivi de capacité indique quoi ajouter et quand. Le stockage objet intégré à la plateforme est en préparation ; d’ici là, utilisez un service compatible S3 chez l’hébergeur de votre choix. Voir [comment fonctionne Swirl Cloud](/swirl-cloud/fonctionnement/) et [la comparaison avec un hyperscaler](/swirl-cloud/comparatif/).
