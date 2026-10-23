---
title: 'Cyber Resilience Act: What Software and Device Makers Must Do'
description: 'The EU Cyber Resilience Act for software and connected products: who is covered, the vulnerability reporting due since September 2026 and the 2027 requirements.'
heading: 'Cyber Resilience Act: what makers of software and connected products must prepare'
lead: 'Since 11 September 2026, manufacturers must report actively exploited vulnerabilities in their products within 24 hours. By 11 December 2027, every product with digital elements sold in the EU must meet the regulation’s security requirements and carry the CE marking for them. Here is what that covers and how to prepare.'
published: 2026-10-23
updated: 2026-10-23
sources:
  - label: 'Regulation (EU) 2024/2847 (Cyber Resilience Act), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2024/2847/oj'
  - label: 'European Commission: CRA reporting obligations'
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cra-reporting'
  - label: 'ENISA: the CRA Single Reporting Platform is launched'
    url: 'https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched'
  - label: 'Implementing Regulation (EU) 2025/2392: important and critical product categories, EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg_impl/2025/2392/oj'
  - label: 'European Commission: the CRA and open source'
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cra-open-source'
  - label: 'ANSSI: the Cyber Resilience Act'
    url: 'https://cyber.gouv.fr/en/regulations/the-cyber-resilience-act-cra/'
---

## The Cyber Resilience Act in brief

The Cyber Resilience Act (CRA), Regulation (EU) 2024/2847, sets security rules for products with digital elements placed on the EU market. It entered into force on 10 December 2024 and applies in three steps:

- **11 June 2026:** rules on the bodies that will assess conformity;
- **11 September 2026:** manufacturers must report actively exploited vulnerabilities and severe incidents (Article 14);
- **11 December 2027:** everything else, including the security requirements, the support period and the CE marking.

As a regulation, it applies directly in every member state. In France, CERT-FR (ANSSI) receives the reports and the ANFR supervises the market.

## 1. Check whether your products are covered

A product with digital elements is any software or hardware product that connects, directly or indirectly, to a device or a network, together with its remote data processing. That covers a connected sensor and its firmware, a desktop or mobile application, an industrial controller, a router or a software library sold on its own.

- **Remote data processing** is included when the manufacturer designed it, or had it designed, and the product cannot perform one of its functions without it: the cloud back end of a connected device, for example. Cloud services built independently of a product, such as SaaS, fall under other rules like NIS2.
- **Excluded:** products already covered by their own rules, such as medical devices, motor vehicles, certified aviation products and marine equipment.
- **Open source:** free and open-source software is covered only when supplied in the course of a commercial activity. Foundations and other “open-source software stewards” that support such software follow a lighter regime.

The manufacturer carries most obligations, whether it builds the product or has it built and sells it under its own name. Importers and distributors must check that the products they sell comply.

## 2. Report exploited vulnerabilities now

Since 11 September 2026, a manufacturer that becomes aware of an actively exploited vulnerability in its product, or of a severe incident affecting its security, must report it:

- an **early warning within 24 hours**;
- a **notification within 72 hours**, with what is known and the measures taken;
- a **final report** within 14 days of a fix or mitigation being available for a vulnerability, or within one month of the notification for an incident.

Reports go through ENISA’s Single Reporting Platform, opened on 11 September 2026, to the CSIRT of the country of the manufacturer’s main establishment: CERT-FR for a company established in France. The obligation covers products already on the market, not only new ones. Users must also be informed, so they can protect themselves.

Decide now who watches for exploitation of your products, who can file a report within the day, and who has an EU Login account for the platform.

## 3. Build in the security requirements by December 2027

Annex I lists what every product must meet. Among other things, a product must:

- be placed on the market **without known exploitable vulnerabilities**;
- ship with a **secure default configuration**, and a way to reset it to its original state;
- protect data with appropriate access control and encryption, and expose as little as needed;
- receive **security updates**, installed automatically by default where it makes sense, with a way to opt out.

Vulnerability handling is a requirement of its own. The manufacturer must:

- keep a **software bill of materials (SBOM)** in a commonly used, machine-readable format, covering at least the top-level dependencies;
- fix vulnerabilities without delay and publish information about fixed ones;
- run a **coordinated vulnerability disclosure policy**, with a contact address where anyone can report a vulnerability;
- test the product’s security regularly.

## 4. Set and announce a support period

During the support period, the manufacturer handles vulnerabilities and provides security updates. It must reflect how long the product is expected to be used, and last at least five years unless the product is expected to be used for less. Each security update must then remain available for at least ten years after its release, or until the end of the support period if that is later. State the support period where the customer can see it before buying.

## 5. Know your product’s category

Most products are in the default category: the manufacturer assesses conformity itself. Two lists, detailed by Implementing Regulation (EU) 2025/2392, call for more:

- **Important products, class I** (Annex III): for example operating systems, routers and modems, microcontrollers with security functions, VPNs and password managers. Self-assessment is allowed only when harmonised standards or a certification are fully applied; otherwise a notified body is involved.
- **Important products, class II:** for example hypervisors and container runtimes, firewalls and intrusion detection systems. A notified body is always involved.
- **Critical products** (Annex IV): hardware devices with security boxes, smart meter gateways, smartcards and secure elements.

The harmonised standards are being written by CEN, CENELEC and ETSI under a Commission request from 2025. The requirements apply even before they are published.

## 6. Prepare the documentation and the CE marking

Before placing a product on the market from December 2027, the manufacturer draws up the technical documentation, signs an EU declaration of conformity and affixes the CE marking; for software, it can appear on the declaration or on the product’s website. Keep the documentation and the declaration for at least ten years after the product is placed on the market, or for the support period if that is longer.

## What is at stake

Fines can reach €15 million or 2.5% of worldwide annual turnover, whichever is higher, for breaching the security requirements or the manufacturer’s obligations, including reporting. Micro and small enterprises are not fined for missing the 24-hour early warning alone. Market surveillance authorities can also require a product to be corrected or withdrawn.

## The checklist

- A list of your products with digital elements, their category and their remote data processing.
- A named team and a procedure to report within 24 hours, with an account on ENISA’s platform.
- An SBOM generated with each release.
- A published vulnerability disclosure policy and a contact address.
- Security updates you can deliver, automatically where it makes sense.
- A support period decided and shown before purchase.
- Technical documentation, a declaration of conformity and the CE marking by 11 December 2027.

## Where Swirl fits

Swirl builds embedded software and connected devices, mainly in Rust and Kotlin on ARM, ESP32 and embedded Linux built with Yocto, and defines security with the hardware and connectivity from day one, so secure defaults, updates and the SBOM can be designed in rather than added before release. See [our embedded and IoT work](/en/embedded-software-iot/). For the software and back ends you run on Swirl Cloud, running images are scanned continuously and every vulnerability is tracked against a deadline: 15 days for a critical one, 30 for a high one. The support period, the disclosure policy and the reports to CERT-FR remain the manufacturer’s. See [the controls and their evidence](/en/swirl-cloud/security-compliance/).
