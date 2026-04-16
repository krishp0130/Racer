/**
 * Default AIP Agent RID (Neon grid relay / matchmaker).
 * Override with env `AIP_AGENT_RID` in production if you publish a different agent.
 */
export const DEFAULT_AIP_AGENT_RID =
  "ri.aip-agents..agent.e2ae4892-a7fa-438b-a903-814d0cbe8102" as const;

export function getAipAgentRid(): string {
  const fromEnv = process.env.AIP_AGENT_RID?.trim();
  return fromEnv || DEFAULT_AIP_AGENT_RID;
}
