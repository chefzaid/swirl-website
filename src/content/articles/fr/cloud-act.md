---
title: 'Le CLOUD Act et les données hébergées en Europe'
description: 'Ce que permet le CLOUD Act américain, pourquoi la localisation ne suffit pas, ce que disent le droit européen et SecNumCloud, et les questions à poser à un hébergeur.'
heading: 'Le CLOUD Act et les données hébergées en Europe : ce que cela change dans le choix d’un hébergeur'
lead: 'Héberger ses données dans un centre de données européen ne les met pas, à lui seul, hors de portée des autorités américaines : ce qui compte, c’est qui les contrôle. Voici ce que permet le CLOUD Act, ce que le droit européen lui oppose, et comment en tenir compte dans le choix de l’endroit où vivent vos données.'
published: 2026-10-23
updated: 2026-10-23
sources:
  - label: '18 U.S.C. § 2713 : conservation et communication obligatoires des communications et des données'
    url: 'https://www.law.cornell.edu/uscode/text/18/2713'
  - label: '18 U.S.C. § 2703 : communication obligatoire, dont la requête en annulation du paragraphe (h)'
    url: 'https://www.law.cornell.edu/uscode/text/18/2703'
  - label: 'Département de la Justice des États-Unis : entrée en vigueur de l’accord d’accès aux données avec le Royaume-Uni'
    url: 'https://www.justice.gov/archives/opa/pr/landmark-us-uk-data-access-agreement-enters-force'
  - label: 'Règlement (UE) 2016/679 (RGPD), article 48, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj'
  - label: 'Règlement (UE) 2023/2854 (Data Act), article 32, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2023/2854/oj'
  - label: 'Décision d’exécution (UE) 2023/1795 : cadre de protection des données UE–États-Unis, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj'
  - label: 'Tribunal de l’Union européenne, Latombe c. Commission, T-553/23, 3 septembre 2025'
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:62023TJ0553'
  - label: 'ANSSI : référentiel d’exigences SecNumCloud, version 3.2'
    url: 'https://cyber.gouv.fr/sites/default/files/document/secnumcloud-referentiel-exigences-v3.2.pdf'
  - label: 'Ministère de l’Économie (DAJ) : mise en œuvre de l’article 31 de la loi SREN'
    url: 'https://www.economie.gouv.fr/daj/nouvelle-fiche-technique-sur-la-mise-en-oeuvre-de-larticle-31-de-la-loi-du-21-mai-2024-visant-securiser-et-reguler-lespace-numerique-associee-des'
---

## Ce que dit le CLOUD Act

Le Clarifying Lawful Overseas Use of Data Act a été adopté le 23 mars 2018, au sein de la loi de finances fédérale pour 2018 (Consolidated Appropriations Act, 2018). Il a ajouté la section 2713 au code des États-Unis : un fournisseur de services de communications électroniques ou de traitement à distance doit conserver, sauvegarder ou communiquer les données qu’il est légalement tenu de fournir, dès lors qu’elles sont en sa « possession, garde ou contrôle », **que ces données se trouvent aux États-Unis ou à l’étranger**.

Il ne crée pas un nouveau type de demande. Il s’applique aux mandats, injonctions et ordonnances du Stored Communications Act, que les autorités américaines utilisent dans les enquêtes pénales. La collecte à des fins de renseignement extérieur relève d’une autre loi, la section 702 du Foreign Intelligence Surveillance Act (FISA).

## Pourquoi la localisation ne suffit pas

Le critère est le contrôle, pas la géographie. Un fournisseur soumis à la juridiction américaine peut être contraint de remettre les données qu’il contrôle dans un centre de données européen, y compris, selon les cas, celles que détiennent ses filiales européennes. Choisir une région européenne d’un fournisseur cloud américain change donc l’endroit où les données sont stockées, pas les lois qui peuvent les atteindre.

Un fournisseur peut demander à un tribunal américain d’annuler ou de modifier une injonction, dans les 14 jours, lorsque le client n’est pas une personne américaine et ne réside pas aux États-Unis, et que la communication risquerait d’enfreindre le droit d’un « gouvernement étranger qualifié » : un pays ayant conclu un accord exécutif avec les États-Unis. Deux accords de ce type sont en vigueur, avec le Royaume-Uni depuis le 3 octobre 2022 et avec l’Australie depuis le 31 janvier 2024. L’UE et les États-Unis négocient depuis 2019 un accord sur la preuve électronique sans l’avoir conclu : cette voie n’est donc pas ouverte au droit européen.

## Ce que dit le droit européen

- **RGPD, article 48.** Une décision d’une juridiction ou d’une autorité extérieure à l’UE exigeant le transfert ou la communication de données personnelles n’est reconnue ou exécutoire que si elle repose sur un accord international, comme un traité d’entraide judiciaire. Un fournisseur visé par une injonction américaine portant sur des données personnelles d’Européens se trouve donc pris entre deux droits.
- **Data Act, article 32.** Depuis le 12 septembre 2025, les fournisseurs de services de traitement de données doivent prendre des mesures techniques, organisationnelles et juridiques, y compris contractuelles, pour empêcher l’accès d’autorités extérieures à l’UE aux données non personnelles détenues dans l’UE lorsqu’il serait contraire au droit de l’Union ou national. Sans accord international, ils ne peuvent s’y plier que sur une décision motivée, proportionnée et susceptible de recours, doivent en informer le client au préalable sauf si cela compromettait une enquête, et ne communiquer que le minimum.
- **Cadre de protection des données UE–États-Unis.** Depuis le 10 juillet 2023, une décision d’adéquation permet de transférer des données personnelles aux entreprises américaines certifiées dans ce cadre. Le Tribunal de l’Union l’a validée le 3 septembre 2025 (Latombe c. Commission) ; un pourvoi est pendant devant la Cour de justice. Ce cadre encadre les transferts ; il n’empêche pas une injonction fondée sur le CLOUD Act.

## SecNumCloud : la protection contre les lois extra-européennes

En France, la qualification SecNumCloud de l’ANSSI (version 3.2, 2022) ajoute des exigences contre les lois extra-européennes. Entre autres :

- des données stockées et traitées dans l’UE, et un service administré depuis l’UE ;
- un prestataire dont le siège statutaire, l’administration centrale et l’établissement principal se trouvent dans un État membre ;
- aucun actionnaire extra-européen détenant plus de 24 % du capital et des droits de vote, et pas plus de 39 % pour l’ensemble d’entre eux, sans pouvoir de blocage ni de nomination de la majorité du conseil.

L’article 31 de la loi SREN du 21 mai 2024 impose aux administrations de l’État et à certains organismes publics d’héberger leurs données les plus sensibles auprès de services cloud protégés contre l’accès d’autorités extra-européennes ; son décret d’application a été publié en avril 2026, et SecNumCloud est en pratique le moyen d’y répondre. Au niveau européen, le schéma de certification des services cloud (EUCS) n’a toujours pas été adopté.

## Les questions à poser à un hébergeur

- **Qui contrôle les données ?** Le fournisseur, sa maison mère et les juridictions dont ils relèvent, pas seulement l’emplacement du centre de données.
- **Qui détient les clés ?** Des données chiffrées avec des clés que vous seul détenez sont bien plus difficiles à remettre en clair.
- **Quels autres services voient vos données ?** Nom de domaine, diffusion de contenu, supervision, sauvegarde et outils de support appartiennent souvent à d’autres entreprises, dont certaines relèvent du droit américain. Listez-les tous.
- **Que dit le contrat ?** Si le fournisseur vous informe des demandes, les conteste et publie un rapport de transparence.
- **Pouvez-vous partir ?** Des formats standard et un plan de sortie testé vous permettent de déménager si la situation juridique change.

La réponse dépend des données. Beaucoup d’entreprises acceptent un fournisseur américain pour certains usages et gardent leurs données les plus sensibles, ou celles de leurs clients, chez un hébergeur relevant uniquement de la juridiction européenne.

## La place de Swirl Cloud

Swirl Cloud fonctionne sur les serveurs et chez l’hébergeur que vous choisissez, loués, dans vos locaux ou exploités par Swirl sur des serveurs hébergés dans l’UE, et donc sous la juridiction que vous choisissez. Ses secrets restent dans Vault sur votre installation, et vos administrateurs détiennent le kit de récupération. Chaque service externe qu’il contacte est listé avec ce qu’il reçoit, y compris des fournisseurs américains comme Cloudflare, qui voit le trafic web public et dont une installation privée se passe. La télémétrie d’usage des éditeurs est désactivée. Swirl Cloud est un logiciel, pas un service cloud qualifié : pour des données qui exigent SecNumCloud, c’est la qualification du service qui les héberge qui compte. Voir [où vont vos données](/swirl-cloud/souverainete/) et [la comparaison avec un hyperscaler](/swirl-cloud/comparatif/).
