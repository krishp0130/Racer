import type {
  CommunityOntologyState,
  MemberProfile,
} from "@/types/communityOntology";
import {
  COMMUNITY_STORAGE_KEY,
  SEED_COMMUNITY_STATE,
} from "@/data/communitySeed";

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function normalizeMemberProfile(p: MemberProfile): MemberProfile {
  return {
    ...p,
    telemetryDriverId: p.telemetryDriverId ?? null,
    locationShareEnabled: p.locationShareEnabled ?? true,
    locationShareWhenDrivingOnly: p.locationShareWhenDrivingOnly ?? false,
    locationShareFriendsOnly: p.locationShareFriendsOnly ?? false,
  };
}

function normalizeCommunityState(s: CommunityOntologyState): CommunityOntologyState {
  return {
    ...s,
    memberProfiles: s.memberProfiles.map(normalizeMemberProfile),
  };
}

export function newEntityId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadCommunityState(): CommunityOntologyState {
  if (typeof window === "undefined") return clone(SEED_COMMUNITY_STATE);
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) {
      const initial = normalizeCommunityState(clone(SEED_COMMUNITY_STATE));
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as CommunityOntologyState;
    if (parsed.schemaVersion !== 1) {
      const fresh = normalizeCommunityState(clone(SEED_COMMUNITY_STATE));
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const normalized = normalizeCommunityState(parsed);
    return normalized;
  } catch {
    return normalizeCommunityState(clone(SEED_COMMUNITY_STATE));
  }
}

export function saveCommunityState(next: CommunityOntologyState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("racer-community-update"));
  } catch {
    /* quota */
  }
}

export function exportCommunityJson(state: CommunityOntologyState): string {
  return JSON.stringify(state, null, 2);
}
