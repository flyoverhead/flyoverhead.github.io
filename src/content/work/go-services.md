---
title: Go services for platform operations
oneLiner: "Load-balancer fleet API: a day-long approval became one API call. Uploader rewrite: 2–3 minutes to 30 seconds."
kind: go
order: 5
role: Author
period: 2023 – now
employer: Positive Technologies
outcome:
  - value: 1 API call
    label: instead of a day-long approval workflow
  - value: 2–3 min → 30 s
    label: pipeline stage after the Go rewrite
stack: [Go, GitLab CI, Load balancers]
diagram: [Engineer or pipeline, Fleet-management API in Go, Load-balancer fleet]
---

## problem

Changing the load-balancer fleet went through an approval workflow that took a day. Separately, a
pipeline stage run by a Python uploader took 2–3 minutes on every run.

## what I did

- **Load-balancer fleet-management API.** I wrote a Go service that replaced the day-long approval
  workflow with a single API call.
- **Uploader rewrite.** I rewrote a Python uploader in Go, which cut its pipeline stage from 2–3
  minutes to 30 seconds.
