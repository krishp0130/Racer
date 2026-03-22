"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommunityOntologyState } from "@/types/communityOntology";
import { loadCommunityState } from "@/lib/communityStore";
import { SEED_COMMUNITY_STATE } from "@/data/communitySeed";

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function useCommunity(): [
  CommunityOntologyState,
  () => void,
] {
  const [state, setState] = useState<CommunityOntologyState>(() =>
    clone(SEED_COMMUNITY_STATE),
  );

  const refresh = useCallback(() => {
    setState(loadCommunityState());
  }, []);

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("racer-community-update", on);
    return () => window.removeEventListener("racer-community-update", on);
  }, [refresh]);

  return [state, refresh];
}
