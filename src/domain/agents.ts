export type AgentListing={name:string;description:string;ownerId:string;version:string;priceCents?:number;capabilities:string[]};
export function validateAgentListing(a:AgentListing){if(!a.name?.trim()||!a.ownerId?.trim()||!a.version?.trim())throw new Error("invalid agent listing");if(a.capabilities.length>50)throw new Error("too many capabilities");return true}
