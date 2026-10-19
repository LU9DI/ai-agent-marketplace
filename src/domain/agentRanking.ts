export function agentCatalogueOrderBy(sort: string): string {
  if (sort === "popular") return " ORDER BY install_count DESC,updated_at DESC";
  if (sort === "top") {
    return " ORDER BY (COALESCE((SELECT AVG(r.rating) FROM agent_reviews r WHERE r.listing_id=l.id),0)*LN((SELECT COUNT(*)::int FROM agent_installs i WHERE i.listing_id=l.id AND i.status='active')+1)) DESC,install_count DESC,updated_at DESC";
  }
  return " ORDER BY updated_at DESC";
}

export function agentCapabilityFilterValue(capability: string): string {
  return JSON.stringify([capability]);
}
