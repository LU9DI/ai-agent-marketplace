# Agent guidance — ai-agent-marketplace

Independent Node.js/TypeScript/Express and PostgreSQL marketplace for discovering and publishing AI agents.

## Skill routing
- HTTP endpoints and response contracts: read .agents/skills/api-design-principles/SKILL.md.
- JWT, publisher ownership, roles, and tenant access: read .agents/skills/auth-implementation-patterns/SKILL.md.
- Agent manifests, publishing, installation, execution, or third-party integrations: read .agents/skills/agent-supply-chain-review/SKILL.md.

## Validation
Run npm ci, npm run check, and npm test for relevant changes. Never execute third-party artifacts as part of validation unless the sandbox and permissions are explicit and tested.
