---
title: Monoliths to highly available Kubernetes
oneLiner: Mission-critical SCM, messaging and corporate SSO re-architected as highly available services.
kind: migration
order: 4
role: Team lead and senior engineer
period: 2022 – 2023
employer: RusBITech-Astra
outcome:
  - value: "8"
    label: engineers in the unit I led
  - value: 20+
    label: legacy Ansible roles refactored into collections
stack: [Kubernetes, Docker, Keycloak, Terraform, Ansible, Puppet, Prometheus, Grafana]
diagram: [Monolithic service, Containerised components, HA Kubernetes]
---

## problem

Mission-critical internal services — source control, messaging and the corporate single sign-on —
ran as monoliths. Each was a single point of failure for the engineers who depended on it.

## what I did

- **Corporate SSO.** I re-architected the Keycloak SSO from a monolith into a highly available,
  cloud-native service.
- **SCM and messaging.** As team lead, I architected and ran the migration of the source control and
  messaging services to highly available, scalable services on Kubernetes.
- **Automation underneath.** I refactored 20+ legacy Ansible roles into modular collections and
  built CI/CD for fast, predictable, zero-downtime deployments.
- **Observability.** I set up monitoring and alerting with Prometheus, Grafana and Alertmanager.

I led and grew a unit of 8 engineers through this work.
