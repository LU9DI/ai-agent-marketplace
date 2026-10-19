import test from "node:test";
import assert from "node:assert/strict";
import { agentCatalogueOrderBy, agentCapabilityFilterValue, buildAgentCatalogueCountQuery } from "../src/domain/agentRanking.js";

test("top catalogue ranking computes install count without relying on a SELECT alias", () => {
  const orderBy = agentCatalogueOrderBy("top");
  assert.ok(orderBy.includes("SELECT COUNT(*)::int FROM agent_installs"));
  assert.ok(orderBy.includes("LN((SELECT COUNT(*)::int FROM agent_installs"));
  assert.ok(!orderBy.includes("LN(install_count+1)"));
  assert.ok(orderBy.endsWith("install_count DESC,updated_at DESC"));
});

test("popular and recent catalogue ordering remain deterministic", () => {
  assert.equal(agentCatalogueOrderBy("popular"), " ORDER BY install_count DESC,updated_at DESC");
  assert.equal(agentCatalogueOrderBy("recent"), " ORDER BY updated_at DESC");
  assert.equal(agentCatalogueOrderBy("unknown"), " ORDER BY updated_at DESC");
});

test("encodes capability filters as JSON arrays for PostgreSQL JSONB containment", () => {
  assert.equal(agentCapabilityFilterValue("web"), '["web"]');
  assert.equal(agentCapabilityFilterValue("data analysis"), '["data analysis"]');
});

test("catalogue count query binds only parameters used by its predicates", () => {
  assert.deepEqual(buildAgentCatalogueCountQuery("", ""), {
    sql: "SELECT COUNT(*)::int count FROM agent_listings WHERE status='published'",
    params: [],
  });
  assert.deepEqual(buildAgentCatalogueCountQuery("camera", ""), {
    sql: "SELECT COUNT(*)::int count FROM agent_listings WHERE status='published' AND (name ILIKE $1 OR description ILIKE $1)",
    params: ["%camera%"],
  });
  assert.deepEqual(buildAgentCatalogueCountQuery("", "web"), {
    sql: "SELECT COUNT(*)::int count FROM agent_listings WHERE status='published' AND capabilities @> $1::jsonb",
    params: ['["web"]'],
  });
  assert.deepEqual(buildAgentCatalogueCountQuery("camera", "web"), {
    sql: "SELECT COUNT(*)::int count FROM agent_listings WHERE status='published' AND (name ILIKE $1 OR description ILIKE $1) AND capabilities @> $2::jsonb",
    params: ["%camera%", '["web"]'],
  });
});
