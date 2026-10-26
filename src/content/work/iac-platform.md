---
title: A greenfield IaC platform that became the company standard
oneLiner: Built during my probation period, then adopted as the organisation's standard for service delivery.
kind: platform
order: 1
role: Architect and largest contributor
period: 2023 – now
employer: Positive Technologies
outcome:
  - value: "600"
    label: repositories in the estate
  - value: 100+
    label: Ansible roles
  - value: ~20
    label: reusable CI components
  - value: 15–20 → 7–10 min
    label: CI build time with a shared base image
stack: [Terraform, OpenTofu, Ansible, GitLab CI, Vault, Docker, AWS, OpenStack, VMware]
diagram: [Git repository, CI component, Execution environment, Terraform / Ansible, AWS · OpenStack · VMware]
---

## problem

Infrastructure was changed through manual operations. Every change depended on the person making it,
and nothing guaranteed that two environments were built the same way. Credentials were
hard-coded in the automation.

## what I did

I designed and built an infrastructure-as-code platform from scratch, and shipped a
production-ready version within my probation period.

- **One way to run automation.** I built a catalog of reusable GitLab CI components and standard
  execution environments for Terraform, OpenTofu and Ansible, so every repository builds the same
  way and builds are reproducible.
- **No hard-coded credentials.** HashiCorp Vault holds secrets centrally and injects them into
  pipelines at run time.
- **Versioned building blocks.** A private Terraform registry governs module versions. Ansible roles
  and collections configure hosts idempotently across AWS, OpenStack and VMware.
- **Faster pipelines.** A shared CI base image cut build times from 15–20 minutes to 7–10.

The platform became the organisation's standard for service delivery. I remain its largest
contributor and own it end to end.
