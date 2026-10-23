---
title: 'Checklist NIS2 : se préparer en 2026, mesure par mesure'
description: 'Où en est NIS2 en France en octobre 2026, comment savoir si vous êtes concerné, et la gouvernance, les mesures et les notifications à préparer dès maintenant.'
heading: 'Checklist NIS2 : ce qu’il faut préparer en 2026'
lead: 'La France n’a pas encore adopté sa loi NIS2, mais les obligations de la directive sont connues et demandent des mois de mise en place. Cette checklist couvre le périmètre, la gouvernance, les dix mesures de sécurité et la notification des incidents, avec les preuves que chacune exige.'
published: 2026-10-09
updated: 2026-10-23
sources:
  - label: 'Directive (UE) 2022/2555 (NIS2), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj'
  - label: 'ANSSI : la directive NIS 2'
    url: 'https://cyber.gouv.fr/la-directive-nis-2'
  - label: 'Sénat : projet de loi relatif à la résilience des infrastructures critiques et au renforcement de la cybersécurité'
    url: 'https://www.senat.fr/dossier-legislatif/pjl24-033.html'
---

## Où en est NIS2 en France

Les États membres devaient transposer la directive NIS2, (UE) 2022/2555, avant le 17 octobre 2024. En France, elle est portée par le projet de loi relatif à la résilience des infrastructures critiques et au renforcement de la cybersécurité, dit *loi Résilience*, qui transpose aussi la directive sur la résilience des entités critiques (REC) et la directive qui accompagne DORA. Le Sénat l’a adopté le 12 mars 2025. Au 23 octobre 2026, l’Assemblée nationale ne l’a pas voté : l’examen prévu les 7 et 9 octobre a été retiré de l’ordre du jour, sans nouvelle date. En juillet 2026, la Commission européenne a saisi la Cour de justice de l’Union européenne de ce retard.

Tant que la loi et ses décrets ne sont pas publiés, les obligations ci-dessous ne s’appliquent pas en droit français, et leurs échéances précises ne sont pas fixées. L’ANSSI propose déjà un pré-enregistrement volontaire et a publié le 17 mars 2026 le ReCyF, son référentiel de cybersécurité pour NIS2, sous forme de document de travail.

Se préparer maintenant reste utile : la plupart des mesures demandent des mois, et les clients soumis à NIS2 répercutent déjà ses exigences sur leurs fournisseurs.

## 1. Vérifier si vous êtes concerné

- **Le secteur.** NIS2 couvre 18 secteurs : onze secteurs hautement critiques à l’annexe I (énergie, transports, banque, infrastructures des marchés financiers, santé, eau potable, eaux usées, infrastructures numériques, gestion des services TIC entre entreprises, administration publique et espace) et sept autres secteurs critiques à l’annexe II (services postaux et d’expédition, gestion des déchets, produits chimiques, alimentation, fabrication de certains produits, fournisseurs numériques et recherche).
- **La taille.** En règle générale, les moyennes et grandes entreprises sont visées : au moins 50 salariés, ou un chiffre d’affaires annuel et un total de bilan tous deux supérieurs à 10 millions d’euros. Certaines entités le sont quelle que soit leur taille, comme les fournisseurs de services DNS, les registres de noms de domaine de premier niveau, les prestataires de services de confiance et les fournisseurs de réseaux de communications électroniques publics.
- **La catégorie.** Les grandes entreprises des secteurs de l’annexe I sont en général des entités *essentielles* ; la plupart des autres entités visées sont *importantes*. Les entités essentielles peuvent être contrôlées avant tout incident ; les entités importantes, a posteriori.

L’ANSSI met à disposition un test d’éligibilité sur son site. Faites-le pour chaque entité juridique de votre groupe.

## 2. Impliquer la direction

L’article 20 impose aux organes de direction d’approuver les mesures de gestion des risques de cybersécurité, d’en superviser la mise en œuvre et d’en répondre. Leurs membres doivent suivre une formation, et la directive encourage aussi la formation régulière du personnel.

**Preuves à préparer :** une politique de sécurité approuvée par la direction, le compte rendu de son approbation et les attestations de formation.

## 3. Couvrir les dix mesures de l’article 21

L’article 21, paragraphe 2, fixe les mesures minimales, selon une approche « tous risques » et proportionnée à vos risques. Pour chacune, les preuves qu’un auditeur attendra :

1. **Analyse des risques et politiques de sécurité des systèmes d’information :** un registre des risques et une politique approuvée.
2. **Gestion des incidents :** des procédures de détection, de tri et de réponse, et un registre des incidents.
3. **Continuité des activités :** sauvegardes, reprise après sinistre et gestion de crise, avec des restaurations testées.
4. **Sécurité de la chaîne d’approvisionnement :** un inventaire des fournisseurs, des clauses de sécurité et des évaluations.
5. **Sécurité de l’acquisition, du développement et de la maintenance,** y compris le traitement et la divulgation des vulnérabilités : les relevés d’analyse et de correctifs, et un contact pour signaler une vulnérabilité.
6. **Évaluation de l’efficacité :** audits, tests et suivi de leurs constats.
7. **Cyberhygiène et formation :** un programme de sensibilisation et les présences.
8. **Cryptographie et chiffrement :** une politique, TLS sur chaque adresse publique et le chiffrement au repos quand les données l’exigent.
9. **Sécurité des ressources humaines, contrôle d’accès et gestion des actifs :** procédures d’arrivée, de mobilité et de départ, revues d’accès périodiques et inventaire des actifs.
10. **Authentification multifacteur et communications sécurisées :** la double authentification pour les comptes qui comptent, et des communications vocales, vidéo, écrites et d’urgence sécurisées lorsque c’est approprié.

## 4. Préparer la notification des incidents

L’article 23 fixe le calendrier d’un incident important, notifié au CSIRT ou à l’autorité compétente (l’ANSSI en France, une fois la loi applicable) :

- une **alerte précoce sous 24 heures** après en avoir pris connaissance ;
- une **notification d’incident sous 72 heures**, avec une première évaluation ;
- un **rapport final sous un mois** après la notification, ou un rapport d’avancement si l’incident est toujours en cours.

Décidez dès maintenant qui juge qu’un incident est important, comment joindre l’autorité et comment reconstituer une chronologie à partir de vos journaux. Une violation de données personnelles se notifie en plus à la CNIL sous 72 heures au titre du RGPD, une obligation distincte.

## 5. Regarder vos fournisseurs, et vos clients

Les entités soumises à NIS2 doivent sécuriser leur chaîne d’approvisionnement : elles demandent donc des preuves à leurs fournisseurs, par des questionnaires et des clauses contractuelles, même quand ces fournisseurs ne sont pas concernés eux-mêmes. Tenez un dossier de sécurité court et factuel : vos politiques, toute certification ou tout rapport d’audit, et votre traitement des vulnérabilités et des incidents.

## 6. S’enregistrer quand la loi s’appliquera

Une fois la loi et ses décrets en vigueur, les entités concernées s’enregistreront auprès de l’ANSSI, qui publiera les échéances. Le pré-enregistrement est aujourd’hui volontaire.

## Ce qui est en jeu

La directive impose aux États membres de prévoir des amendes pouvant atteindre au moins 10 millions d’euros ou 2 % du chiffre d’affaires annuel mondial, le montant le plus élevé étant retenu, pour les entités essentielles, et 7 millions d’euros ou 1,4 % pour les entités importantes. La loi française fixera les montants définitifs.

## La place de Swirl Cloud

Swirl Cloud couvre la partie technique de cette checklist. Ses contrôles sont rattachés à l’article 21, paragraphe 2, de l’authentification unique et des revues d’accès aux sauvegardes, à la gestion des vulnérabilités et au chiffrement en transit, et ils sont évalués en continu sur votre installation. Les rapports d’incident sont préparés avec les échéances de 24 heures, 72 heures et un mois, et un dossier de preuves part chez vos auditeurs. La gouvernance, l’analyse des risques, la formation et les accords avec vos fournisseurs restent de votre ressort ; la plateforme liste les documents à produire. [Voir les contrôles et leurs preuves](/swirl-cloud/securite-conformite/).
