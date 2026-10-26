---
name: agent-supply-chain-review
description: Review publishing, installing, updating, and running third-party AI agents safely.
---
# Agent supply-chain review
- Treat agent manifests, prompts, tool definitions, URLs, packages, and claimed capabilities as untrusted publisher input.
- Validate schemas, versions, permissions, origin, provenance, license metadata, and integrity hashes before accepting an artifact.
- Separate metadata discovery from execution; never run submitted code during listing, preview, or review.
- Apply least privilege to tools and credentials; isolate execution and enforce network, filesystem, CPU, memory, and time limits where execution exists.
- Require explicit user consent for sensitive capabilities and irreversible actions.
- Keep user data and credentials out of prompts, telemetry, logs, and agent-visible context unless strictly necessary.
- Test malicious manifests, prompt injection, permission escalation, artifact tampering, revocation, and rollback.
