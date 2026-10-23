---
title: 'The CLOUD Act and Data Hosted in Europe: What It Means'
description: 'What the US CLOUD Act allows, why data location alone does not settle it, what EU law and SecNumCloud say, and the questions to ask when choosing a host.'
heading: 'The CLOUD Act and data hosted in Europe: what it changes when you choose a host'
lead: 'Hosting data in a European data centre does not by itself keep it out of reach of US authorities: what counts is who controls it. Here is what the CLOUD Act allows, what EU law opposes to it, and how to weigh it when choosing where your data lives.'
published: 2026-10-23
updated: 2026-10-23
sources:
  - label: '18 U.S.C. § 2713: required preservation and disclosure of communications and records'
    url: 'https://www.law.cornell.edu/uscode/text/18/2713'
  - label: '18 U.S.C. § 2703: required disclosure, including the motion to quash in subsection (h)'
    url: 'https://www.law.cornell.edu/uscode/text/18/2703'
  - label: 'US Department of Justice: the US–UK data access agreement enters into force'
    url: 'https://www.justice.gov/archives/opa/pr/landmark-us-uk-data-access-agreement-enters-force'
  - label: 'Regulation (EU) 2016/679 (GDPR), Article 48, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj'
  - label: 'Regulation (EU) 2023/2854 (Data Act), Article 32, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2023/2854/oj'
  - label: 'Implementing Decision (EU) 2023/1795: EU–US Data Privacy Framework, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj'
  - label: 'General Court, Latombe v Commission, T-553/23, 3 September 2025'
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62023TJ0553'
  - label: 'ANSSI: SecNumCloud requirements, version 3.2'
    url: 'https://cyber.gouv.fr/sites/default/files/document/secnumcloud-referentiel-exigences-v3.2.pdf'
  - label: 'French Ministry of the Economy (DAJ): implementing Article 31 of the SREN law'
    url: 'https://www.economie.gouv.fr/daj/nouvelle-fiche-technique-sur-la-mise-en-oeuvre-de-larticle-31-de-la-loi-du-21-mai-2024-visant-securiser-et-reguler-lespace-numerique-associee-des'
---

## What the CLOUD Act says

The Clarifying Lawful Overseas Use of Data Act was enacted on 23 March 2018, as part of the Consolidated Appropriations Act, 2018. It added Section 2713 to the US Code: a provider of electronic communication or remote computing services must preserve, back up or disclose the data it is legally required to, when that data is in its “possession, custody, or control”, **“regardless of whether” it is located within or outside the United States**.

It does not create a new kind of request. It applies to the warrants, subpoenas and court orders of the Stored Communications Act, which US authorities use in criminal investigations. Collection for foreign intelligence falls under a different law, Section 702 of the Foreign Intelligence Surveillance Act (FISA).

## Why location alone does not settle it

The test is control, not geography. A provider subject to US jurisdiction can be ordered to hand over data it controls in a European data centre, including, depending on the facts, data held by its European subsidiaries. Choosing an EU region of a US cloud provider therefore changes where the data is stored, not which laws can reach it.

A provider can ask a US court to quash or modify an order, within 14 days, when the customer is not a US person and does not live in the United States, and disclosure would risk breaching the laws of a “qualifying foreign government”: a country that has signed an executive agreement with the United States. Two such agreements are in force, with the United Kingdom since 3 October 2022 and with Australia since 31 January 2024. The EU and the United States have negotiated an agreement on electronic evidence since 2019 without concluding one, so this statutory route is not open to EU laws.

## What EU law says

- **GDPR, Article 48.** A decision of a court or authority outside the EU requiring personal data to be transferred or disclosed is recognised or enforceable only if it is based on an international agreement, such as a mutual legal assistance treaty. A provider facing a US order for personal data of Europeans is therefore caught between two laws.
- **Data Act, Article 32.** Since 12 September 2025, providers of data processing services must take technical, organisational and legal measures, including contractual ones, to prevent governmental access from outside the EU to non-personal data held in the EU where it would conflict with EU or national law. Without an international agreement, they may comply only with a reasoned and proportionate order open to review, must tell the customer beforehand unless that would undermine an investigation, and must disclose the minimum.
- **EU–US Data Privacy Framework.** Since 10 July 2023, an adequacy decision allows personal data to be transferred to US companies certified under the framework. The General Court upheld it on 3 September 2025 (Latombe v Commission); an appeal is pending before the Court of Justice. The framework governs transfers; it does not stop a CLOUD Act order.

## SecNumCloud: protection against non-EU laws

In France, ANSSI’s SecNumCloud qualification (version 3.2, 2022) adds requirements against non-EU laws. Among them:

- data stored and processed in the EU, and the service administered from the EU;
- a provider whose registered office, central administration and main establishment are in an EU member state;
- no non-EU shareholder holding more than 24% of the capital and voting rights, and no more than 39% for all of them together, without the power to block decisions or appoint most of the board.

Article 31 of the French SREN law of 21 May 2024 requires State administrations and some public bodies to host their most sensitive data with cloud services protected against access by non-EU authorities; its implementing decree was published in April 2026, and SecNumCloud is the way to meet it in practice. At European level, the cloud certification scheme (EUCS) has still not been adopted.

## Questions to ask a host

- **Who controls the data?** The provider, its parent company and the jurisdictions they answer to, not only the data centre’s location.
- **Who holds the keys?** Data encrypted with keys you alone hold is much harder to hand over in readable form.
- **Which other services see your data?** Domain name, content delivery, monitoring, backup and support tools often belong to other companies, some under US law. List them all.
- **What does the contract say?** Whether the provider tells you about requests, challenges them and publishes a transparency report.
- **Can you leave?** Standard formats and a tested exit plan let you move if the legal situation changes.

The answer depends on the data. Many companies accept a US provider for some workloads and keep their most sensitive data, or their customers’, with a host under EU jurisdiction only.

## Where Swirl Cloud fits

Swirl Cloud runs on the servers and at the host you choose, rented, on your premises or operated by Swirl on servers hosted in the EU, and so under the jurisdiction you choose. Its secrets stay in Vault on your installation, and your administrators hold the recovery kit. Every outside service it contacts is listed with what it receives, including US providers such as Cloudflare, which sees public web traffic and which a private installation does without. Vendor usage telemetry is switched off. Swirl Cloud is software, not a qualified cloud service: for data that requires SecNumCloud, the qualification of the service that hosts it is what counts. See [where your data goes](/en/swirl-cloud/sovereignty/) and [how it compares with a hyperscaler](/en/swirl-cloud/comparison/).
