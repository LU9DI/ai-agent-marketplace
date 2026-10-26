---
name: api-design-principles
description: Design stable API contracts for the AI agent marketplace.
---
# API design principles
- Follow existing Express route, validation, response, and error conventions.
- Validate untrusted input and bound payload sizes, pagination, execution time, and expensive operations.
- Keep authentication, authorization, validation, business logic, and persistence distinct.
- Use stable errors without stack traces, secrets, or personal data.
- Make publishing, purchases, and other mutations idempotent where retries are possible.
- Test unauthenticated, forbidden, malformed, duplicate, timeout, and success paths.
