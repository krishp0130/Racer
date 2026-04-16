/**
 * MVP global ratings until head-to-head / Foundry-backed ELO exists.
 * Merged in UI with live community state (member profiles).
 */
export const SYNTHETIC_ELO_BY_MEMBER: Record<
  string,
  { elo: number; weeklyDelta: number }
> = {
  "member-krish": { elo: 1842, weeklyDelta: 12 },
  "member-sara": { elo: 1812, weeklyDelta: -4 },
  "member-neon": { elo: 1798, weeklyDelta: 7 },
  "member-maya": { elo: 1765, weeklyDelta: 0 },
  "member-dean": { elo: 1744, weeklyDelta: -11 },
  "member-rio": { elo: 1688, weeklyDelta: 3 },
};

export function syntheticEloForMember(memberId: string): {
  elo: number;
  weeklyDelta: number;
} {
  const row = SYNTHETIC_ELO_BY_MEMBER[memberId];
  if (row) return row;
  return { elo: 1500, weeklyDelta: 0 };
}
