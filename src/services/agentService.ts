import { validateAgentListing,type AgentListing } from "../domain/agents.js";
export function prepareListing(a:AgentListing){validateAgentListing(a);return a;}
