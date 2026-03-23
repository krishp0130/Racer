import { areFriends } from "@/lib/friendUtils";
import type { FriendRequest, MemberProfile } from "@/types/communityOntology";
import type { LiveTelemetry } from "@/types/ontology";

/** Minimum mph to count as “driving” for `locationShareWhenDrivingOnly`. */
export const MIN_DRIVING_SPEED_MPH = 12;

/**
 * Whether a driver should appear on another member’s map given Ontology-linked
 * `MemberProfile` + latest telemetry.
 *
 * Call only when `profile.telemetryDriverId` matches `latestTelemetry.driverId`.
 *
 * TODO(OSDK): evaluate in Foundry Function or stream processor before indexing geo queries.
 */
export function shouldExposeDriverToViewer(
  profile: MemberProfile,
  latestTelemetry: LiveTelemetry,
  viewerMemberId: string | undefined,
  friendRequests: FriendRequest[],
): boolean {
  if (!profile.telemetryDriverId) return true;

  if (!profile.locationShareEnabled) return false;

  if (profile.locationShareWhenDrivingOnly) {
    if (latestTelemetry.speed < MIN_DRIVING_SPEED_MPH) return false;
  }

  if (profile.locationShareFriendsOnly) {
    if (!viewerMemberId) return false;
    if (!areFriends(viewerMemberId, profile.id, friendRequests)) return false;
  }

  return true;
}
