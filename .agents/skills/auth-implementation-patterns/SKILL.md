---
name: auth-implementation-patterns
description: Review JWT authentication, ownership, seller permissions, and tenant isolation.
---
# Authentication and authorization
- Verify JWT signature and expiry and validate issuer/audience when configured.
- Enforce object-level authorization for agent listings, publisher ownership, reviews, subscriptions, and admin operations.
- Never trust seller IDs or roles supplied only by request payloads.
- Keep secrets in environment/secret storage and redact credentials from logs.
- Fail closed on invalid auth configuration.
- Test missing, malformed, expired, wrong-role, cross-user, and revoked credentials.
