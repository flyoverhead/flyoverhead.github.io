---
title: Granular Vault scope migration
oneLiner: One broad CI Vault token replaced by a least-privilege scope for each Ansible role.
kind: security
order: 6
role: Designer and lead engineer
period: "2026"
employer: Positive Technologies
outcome:
  - value: "22"
    label: per-role Vault scopes, each proven to reach only its own paths
  - value: ~70%
    label: of Ansible roles needed no Vault access, yet held a broad token
  - value: "3"
    label: "token tiers: deploy, read-only merge-request checks, molecule tests"
  - value: "53"
    label: releases of roles and CI components in four days
stack: [HashiCorp Vault, GitLab CI, Ansible, Terraform]
diagram: [CI job ID token, Token exchange per role, Scoped Vault token, Ansible role]
---

## problem

Every CI job logged in to Vault once and used that one token for the whole job. An Ansible run
executes every role in the playbook under it, so a role that reads a single key ran with
permissions that could rotate host root passwords, issue certificates and administer cloud
projects. About 70% of the roles needed no Vault access at all.

## what I did

I designed and led the move to a least-privilege scope per Ansible role, without changing how
services run their pipelines.

- **One scope per role.** The CI job's GitLab ID token is exchanged for a Vault token scoped to
  exactly one Ansible role. A small shared role does the exchange as a dependency, so no service
  playbook had to change.
- **Gradual, safe rollout.** A per-service switch with a legacy fallback lets roles and services
  upgrade independently.
- **Read-only merge-request checks.** Dry runs use read-only twins of each scope that hold only
  what check mode reads; Vault refuses their writes.
- **Proven, not assumed.** A test harness checks that every scope reaches its own paths and is
  denied its neighbours'. Vault roles and policies are code, merged only after reading the
  Terraform plan.

The groundwork shipped in 53 releases over four days. The first services run on scoped tokens,
and the rest follow in small batches.
