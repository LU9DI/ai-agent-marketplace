import test from "node:test";
import assert from "node:assert/strict";
import { agentCatalogueOrderBy } from "../src/domain/agentRanking.js";

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
