/**
 * Community & telemetry objects shaped for a future Palantir Ontology + OSDK sync.
 * Serialize as JSON for local MVP storage (`racer:ontology:community:v1`).
 *
 * TODO(Foundry): register these as Object Types / link types in Ontology Manager,
 * then replace local persistence with OSDK `client(MemberProfile).fetchPage()` etc.
 */

export interface MemberProfile {
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Unique handle */
  username: string;
  bio: string;
  /** Avatar — URL or data URL (MVP); production: Foundry media / object storage link */
  profileImageUrl: string | null;
  /** Interest tags, e.g. JDM, bikes, meets */
  carInterests: string[];
  /** Primary daily driver in garage */
  currentVehicleId: string | null;
  createdAt: string;
}

/** Extended vehicle record for garage (beyond core Ontology `Vehicle`). */
export interface GarageVehicle {
  id: string;
  ownerMemberId: string;
  make: string;
  model: string;
  year: number;
  /** Exterior / livery description */
  color: string;
  /** Hero image — `/garage/...` or external URL */
  imageUrl: string | null;
  /** Mods & build notes (Liberty Walk, turbo, etc.) */
  mods: string[];
  /** Freeform owner notes */
  notes: string;
  /** Shown as “current” on profile when selected */
  isPrimary: boolean;
  /** Approximate for demo / insurance class */
  horsepowerEstimate: number | null;
}

export type PerformanceRunType =
  | "zero_to_sixty"
  | "zero_to_hundred"
  | "half_mile"
  | "quarter_mile";

/** Acceleration / strip timing tied to a member (and optional garage car). */
export interface PerformanceRun {
  id: string;
  driverId: string;
  vehicleId: string | null;
  runType: PerformanceRunType;
  /** Elapsed seconds for 0–60 / 0–100 */
  elapsedSeconds: number | null;
  /** Trap speed mph (half / quarter mile) */
  trapSpeedMph: number | null;
  /** Elapsed seconds for distance runs if recorded */
  elapsedSecondsDistance: number | null;
  recordedAt: string;
  notes: string;
}

/** Point-in-time telemetry for “track drivers” history (Ontology: time-series or snapshots). */
export interface DriverTelemetrySnapshot {
  id: string;
  driverId: string;
  recordedAt: string;
  speedMph: number;
  latitude: number;
  longitude: number;
  heading: number;
}

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface FriendRequest {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface DirectConversation {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderMemberId: string;
  body: string;
  sentAt: string;
}

export interface GroupConversation {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
  lastMessageAt: string;
}

export type ForumCategory =
  | "cars"
  | "bikes"
  | "general"
  | "meets"
  | "tech"
  | "motorsport";

export interface Forum {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ForumCategory;
}

export interface ForumThread {
  id: string;
  forumId: string;
  authorMemberId: string;
  title: string;
  body: string;
  createdAt: string;
  replyCount: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorMemberId: string;
  body: string;
  createdAt: string;
}

/** Root document stored in localStorage / exported for Foundry pipelines. */
export interface CommunityOntologyState {
  schemaVersion: 1;
  /** Logged-in member for MVP (single user device). */
  currentMemberId: string;
  memberProfiles: MemberProfile[];
  garageVehicles: GarageVehicle[];
  performanceRuns: PerformanceRun[];
  telemetrySnapshots: DriverTelemetrySnapshot[];
  friendRequests: FriendRequest[];
  directConversations: DirectConversation[];
  groupConversations: GroupConversation[];
  chatMessages: ChatMessage[];
  forums: Forum[];
  forumThreads: ForumThread[];
  forumReplies: ForumReply[];
  /** Member ids joined per forum (MVP). */
  forumMemberships: { forumId: string; memberId: string }[];
}
