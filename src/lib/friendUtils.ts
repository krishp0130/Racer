import type { FriendRequest } from "@/types/communityOntology";

export function areFriends(
  a: string,
  b: string,
  requests: FriendRequest[],
): boolean {
  return requests.some(
    (r) =>
      r.status === "accepted" &&
      ((r.fromMemberId === a && r.toMemberId === b) ||
        (r.fromMemberId === b && r.toMemberId === a)),
  );
}

export function hasPendingBetween(
  a: string,
  b: string,
  requests: FriendRequest[],
): boolean {
  return requests.some(
    (r) =>
      r.status === "pending" &&
      ((r.fromMemberId === a && r.toMemberId === b) ||
        (r.fromMemberId === b && r.toMemberId === a)),
  );
}
