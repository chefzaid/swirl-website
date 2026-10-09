---
title: 'NIS2 Readiness Checklist for Companies in France (2026)'
description: 'Where NIS2 stands in France in October 2026, how to check whether you are in scope, and the governance, measures and reporting to prepare now.'
heading: 'NIS2 readiness checklist: what to prepare in 2026'
lead: 'France has not yet adopted its NIS2 law, but the directive’s obligations are known and take months to put in place. This checklist covers scope, governance, the ten security measures and incident reporting, with the evidence each one calls for.'
published: 2026-10-09
updated: 2026-10-09
sources:
  - label: 'Directive (EU) 2022/2555 (NIS2), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj'
  - label: 'ANSSI: the NIS 2 directive'
    url: 'https://cyber.gouv.fr/la-directive-nis-2'
  - label: 'French Senate: resilience of critical infrastructure and cybersecurity bill'
    url: 'https://www.senat.fr/dossier-legislatif/pjl24-033.html'
---

## Where NIS2 stands in France

Member states had to transpose the NIS2 Directive, (EU) 2022/2555, by 17 October 2024. In France it is carried by the bill on the resilience of critical infrastructure and the strengthening of cybersecurity, known as the *loi Résilience*, which also transposes the critical entities resilience (CER) directive and the directive that accompanies DORA. The Senate adopted the bill on 12 March 2025. As of 9 October 2026 the National Assembly has not voted on it: the debate planned for early October was postponed. In July 2026 the European Commission referred France to the Court of Justice of the EU for the delay.

Until the law and its decrees are published, the obligations below do not apply under French law, and their exact deadlines are not set. ANSSI already offers a voluntary pre-registration, and on 17 March 2026 it published ReCyF, its cybersecurity reference framework for NIS2, as a working document.

Preparing now is still worth it. Most measures take months to put in place, and customers covered by NIS2 already pass its supply-chain requirements on to their suppliers.

## 1. Check whether you are in scope

- **Sector.** NIS2 covers 18 sectors: eleven of high criticality in Annex I (energy, transport, banking, financial market infrastructures, health, drinking water, waste water, digital infrastructure, ICT service management between businesses, public administration and space) and seven other critical sectors in Annex II (postal and courier services, waste management, chemicals, food, manufacturing of certain products, digital providers and research).
- **Size.** As a rule, medium-sized and large companies are covered: at least 50 employees, or both an annual turnover and a balance sheet above €10 million. Some entities are covered whatever their size, such as DNS service providers, top-level domain registries, trust service providers and providers of public electronic communications networks.
- **Category.** Large companies in Annex I sectors are generally *essential* entities; most other entities in scope are *important*. Essential entities can be supervised before any incident; important entities after the fact.

ANSSI provides an eligibility test on its website. Run it once for each legal entity in your group.

## 2. Put management in charge

Article 20 makes management bodies approve the cybersecurity risk-management measures, oversee their implementation and answer for failures. Their members must follow training, and the directive encourages regular training for employees as well.

**Evidence to have ready:** a security policy approved by management, the minutes where it was approved, and training records.

## 3. Cover the ten measures of Article 21

Article 21(2) lists the minimum measures, taken on an all-hazards basis and in proportion to your risks. For each, the evidence an auditor will expect:

1. **Risk analysis and information system security policies:** a risk register and an approved policy.
2. **Incident handling:** detection, triage and response procedures, and an incident register.
3. **Business continuity:** backups, disaster recovery and crisis management, with tested restores.
4. **Supply chain security:** an inventory of suppliers, security clauses and assessments.
5. **Security in acquisition, development and maintenance,** including vulnerability handling and disclosure: scan and patch records and a contact for reporting vulnerabilities.
6. **Assessing effectiveness:** audits, tests and follow-up of their findings.
7. **Basic cyber hygiene and training:** an awareness programme and attendance records.
8. **Cryptography and encryption:** a policy, TLS on every public address and encryption at rest where data requires it.
9. **Human resources security, access control and asset management:** joiner, mover and leaver processes, periodic access reviews and an asset inventory.
10. **Multi-factor authentication and secured communications:** MFA for accounts that matter, and secured voice, video, text and emergency communications where appropriate.

## 4. Prepare incident reporting

Article 23 sets the timeline for a significant incident, reported to the CSIRT or the competent authority (ANSSI in France, once the law applies):

- an **early warning within 24 hours** of becoming aware of it;
- an **incident notification within 72 hours**, with an initial assessment;
- a **final report within one month** of the notification, or a progress report if the incident is still ongoing.

Decide now who judges whether an incident is significant, how you reach the authority, and how you will rebuild a timeline from your logs. A personal data breach is also notified to the CNIL within 72 hours under the GDPR, a separate obligation.

## 5. Look at your suppliers, and at your customers

Entities covered by NIS2 must secure their supply chain, so they ask their suppliers for evidence through questionnaires and contract clauses, even when the supplier is not covered itself. Keep a short, factual security file: your policies, any certification or audit report, and how you handle vulnerabilities and incidents.

## 6. Register when the law applies

Once the law and its decrees are in force, covered entities will register with ANSSI, which will publish the deadlines. Pre-registration is voluntary today.

## What is at stake

The directive requires member states to allow fines of up to at least €10 million or 2% of worldwide annual turnover, whichever is higher, for essential entities, and €7 million or 1.4% for important entities. The French law will set the final amounts.

## Where Swirl Cloud fits

Swirl Cloud covers the technical side of this checklist. Its controls are mapped to Article 21(2), from single sign-on and access reviews to backups, vulnerability management and encryption in transit, and they are evaluated continuously on your installation. Incident reports are drafted with the 24-hour, 72-hour and one-month deadlines, and an evidence pack goes to your auditors. Governance, risk analysis, training and supplier agreements remain yours; the platform lists the documents to produce. [See the controls and their evidence](/en/swirl-cloud/security-compliance/).
