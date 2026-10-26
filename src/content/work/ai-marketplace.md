---
title: An AI plugin marketplace for infrastructure engineers
oneLiner: "Claude Code plugins for the team: Terraform modules in days instead of weeks, Ansible roles in a day instead of a week."
kind: ai
order: 2
role: Designer and author
period: 2025 – now
employer: Positive Technologies
outcome:
  - value: weeks → days
    label: delivering a Terraform module
  - value: a week → a day
    label: delivering an Ansible role
stack: [Claude Code, MCP, Terraform, Ansible, GitLab CI]
diagram: [Engineer, Claude Code, Plugin marketplace, Terraform module · Ansible role]
---

## problem

Routine automation was slow. Each new Terraform module or Ansible role had to follow the platform's
standards, and doing that by hand took weeks for a module and a week for a role.

## what I did

I designed and built a marketplace of plugins for Claude Code AI agents, and my team uses it.

- **Standards in context.** Plugins give the agent the platform's conventions through skills,
  agents and MCP integrations. It produces code that fits the platform on the first pass instead of
  generic code.
- **Context engineering over prompting.** The plugins are built around what the agent needs to
  know for the task, rather than around clever prompts.

Delivery time for a Terraform module dropped from weeks to days, and for an Ansible role from a week
to a day.
