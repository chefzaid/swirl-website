---
title: 'Leaving a Hyperscaler: A Practical Exit Plan'
description: 'How to leave a hyperscaler step by step: your rights under the EU Data Act, what to inventory, portable equivalents, sizing, data moves and cutover.'
heading: 'Leaving a hyperscaler: a practical exit plan'
lead: 'Usage-based bills, dependence on one provider and jurisdiction questions lead more companies to bring workloads back onto servers they choose. The EU Data Act now makes switching a right. This plan takes you from inventory to cutover.'
published: 2026-10-09
updated: 2026-10-09
sources:
  - label: 'Regulation (EU) 2023/2854 (Data Act), EUR-Lex'
    url: 'https://eur-lex.europa.eu/eli/reg/2023/2854/oj'
  - label: 'European Commission: the Data Act'
    url: 'https://digital-strategy.ec.europa.eu/en/policies/data-act'
---

## What the Data Act changes

Since 12 September 2025, the Data Act, Regulation (EU) 2023/2854, gives customers of cloud services the right to switch to another provider or to their own infrastructure. Its Article 25 sets the frame:

- the provider may require **at most two months’ notice** before switching starts;
- the switch must then be completed within a **transition period of 30 calendar days**, which the provider can extend to seven months at most if it shows the switch is technically unfeasible sooner;
- you keep **at least 30 days** to retrieve your data after the transition;
- until 12 January 2027, the provider may charge for switching, data transfer included, only at its direct cost; **from 12 January 2027, switching charges are banned**.

Early termination penalties agreed in your contract are not covered by the ban, so check your commitments. In 2024 the largest providers also announced that they waive data transfer fees for customers who leave, under conditions such as completing the move within a set period; check your provider’s current terms before you start.

## 1. Inventory what you run

List every service you use, grouped by type: virtual machines and containers, serverless functions, managed databases, object storage, queues and streaming, identity, CI/CD, monitoring and logs, DNS and content delivery. For each, note the data volume and its growth, what depends on it, and any reserved capacity or savings commitment with its end date. Your bill, broken down by service, is a good place to start.

## 2. Map each service to a portable equivalent

Most managed services have an open, standard counterpart:

- **Containers and managed Kubernetes:** Kubernetes, with the same images and manifests.
- **Managed PostgreSQL or MySQL:** the same database engine, moved by dump and restore or by replication.
- **Object storage:** an S3-compatible service, which most tools already speak.
- **Queues and streaming:** Kafka or Redis.
- **Identity:** an OpenID Connect and SAML provider such as Keycloak.
- **CI/CD and image registry:** GitLab CI and an OCI registry.
- **Monitoring and logs:** Prometheus, Grafana and Elasticsearch or OpenSearch.

Serverless functions and proprietary databases usually need rewriting. Estimate those first: they decide the length of the project.

## 3. Size the target from measurements

Measure what you actually use for several weeks, including peaks: CPU, memory, storage and its growth, and network traffic. Size the servers from those figures with headroom, and plan for losing one server: either the others absorb its load, or you accept and document the downtime. Fixed-price servers make the bill predictable, but only if they are sized right.

## 4. Rehearse the data move

Copy the data, verify it with counts and checksums, and time the copy. For databases that cannot stop, use replication and keep the target in sync until cutover. Rehearse the whole sequence at least once on a copy, so that the real move holds no surprises and you know how long the final freeze lasts.

## 5. Cut over with a way back

Lower DNS time-to-live values a few days ahead. Run the new platform alongside the old one, switch traffic, and watch error rates and latency against criteria you fixed in advance. Keep the old environment intact and read-only until you are confident, then export what remains, delete it and close the account or request the provider’s exit waiver.

## 6. Update your records

A move changes where data is processed. Update your GDPR records of processing, your list of subprocessors, your data processing agreements and the answers you give in security questionnaires. Financial entities and their ICT suppliers also update their DORA register of information.

## The exit checklist

- Notice period, commitments and early termination terms checked in your contract.
- Inventory of services, data volumes and dependencies.
- A portable equivalent, or a rewrite estimate, for each managed service.
- Target sized from several weeks of measurements, with the loss of one server planned for.
- A rehearsed data move with its measured duration.
- DNS ready, cutover criteria fixed, rollback possible.
- Records, contracts and questionnaires updated.

## Where Swirl Cloud fits

Swirl Cloud gives most of these equivalents in one installation on servers you choose: Kubernetes with GitLab CI, a registry and Argo CD; PostgreSQL, MongoDB, Redis and Kafka; Keycloak single sign-on; Prometheus, Grafana and Elasticsearch. Each server has a fixed monthly cost, shown per environment and application, and capacity planning says what to add and when. Object storage inside the platform is on the roadmap; until then, use an S3-compatible service from a host you choose. See [how Swirl Cloud works](/en/swirl-cloud/how-it-works/) and [how it compares with a hyperscaler](/en/swirl-cloud/comparison/).
