/**
 * MVP persistence for community Ontology-shaped objects (localStorage).
 *
 * TODO(OSDK): For each method, replace with Palantir OSDK / Actions, e.g.:
 *   await client(PerformanceRun).create({ ... })
 *   await client.actions.recordTelemetrySnapshot({ ... })
 */

import type {
  CommunityOntologyState,
  FriendRequest,
  GarageVehicle,
  MemberProfile,
  PerformanceRun,
  DriverTelemetrySnapshot,
  ChatMessage,
  ForumReply,
  ForumThread,
} from "@/types/communityOntology";
import {
  loadCommunityState,
  saveCommunityState,
  newEntityId,
} from "@/lib/communityStore";

function mutate(
  fn: (draft: CommunityOntologyState) => void,
): CommunityOntologyState {
  const s = loadCommunityState();
  fn(s);
  saveCommunityState(s);
  return s;
}

export const communityOntologyService = {
  getState(): CommunityOntologyState {
    return loadCommunityState();
  },

  updateProfile(
    memberId: string,
    patch: Partial<
      Pick<
        MemberProfile,
        | "displayName"
        | "username"
        | "bio"
        | "profileImageUrl"
        | "carInterests"
        | "currentVehicleId"
      >
    >,
  ): void {
    // TODO: client(MemberProfile).fetchOne(memberId).patch(patch)
    mutate((s) => {
      const i = s.memberProfiles.findIndex((m) => m.id === memberId);
      if (i >= 0) s.memberProfiles[i] = { ...s.memberProfiles[i], ...patch };
    });
  },

  addGarageVehicle(
    vehicle: Omit<GarageVehicle, "id"> & { id?: string },
  ): string {
    // TODO: client(GarageVehicle).create(vehicle)
    const id = vehicle.id ?? newEntityId("veh");
    mutate((s) => {
      s.garageVehicles.push({ ...vehicle, id } as GarageVehicle);
    });
    return id;
  },

  updateGarageVehicle(id: string, patch: Partial<GarageVehicle>): void {
    mutate((s) => {
      const i = s.garageVehicles.findIndex((v) => v.id === id);
      if (i >= 0) s.garageVehicles[i] = { ...s.garageVehicles[i], ...patch };
    });
  },

  setPrimaryVehicle(memberId: string, vehicleId: string): void {
    mutate((s) => {
      s.garageVehicles = s.garageVehicles.map((v) =>
        v.ownerMemberId === memberId
          ? { ...v, isPrimary: v.id === vehicleId }
          : v,
      );
      const p = s.memberProfiles.find((m) => m.id === memberId);
      if (p) p.currentVehicleId = vehicleId;
    });
  },

  addPerformanceRun(
    run: Omit<PerformanceRun, "id"> & { id?: string },
  ): string {
    // TODO: client(PerformanceRun).create(run)
    const id = run.id ?? newEntityId("run");
    mutate((s) => {
      s.performanceRuns.push({ ...run, id } as PerformanceRun);
    });
    return id;
  },

  addTelemetrySnapshot(
    snap: Omit<DriverTelemetrySnapshot, "id"> & { id?: string },
  ): string {
    // TODO: streaming Action or object create for LiveTelemetry / Snapshot
    const id = snap.id ?? newEntityId("tel");
    mutate((s) => {
      s.telemetrySnapshots.unshift({ ...snap, id } as DriverTelemetrySnapshot);
      if (s.telemetrySnapshots.length > 200) {
        s.telemetrySnapshots = s.telemetrySnapshots.slice(0, 200);
      }
    });
    return id;
  },

  respondFriendRequest(requestId: string, accept: boolean): void {
    // TODO: client(FriendRequest).fetchOne(requestId).patch({ status })
    mutate((s) => {
      const r = s.friendRequests.find((x) => x.id === requestId);
      if (r) r.status = accept ? "accepted" : "rejected";
    });
  },

  sendFriendRequest(fromMemberId: string, toMemberId: string): string | null {
    const cur = loadCommunityState();
    const dup = cur.friendRequests.some(
      (x) =>
        x.fromMemberId === fromMemberId &&
        x.toMemberId === toMemberId &&
        x.status === "pending",
    );
    if (dup) return null;
    const id = newEntityId("fr");
    mutate((s) => {
      s.friendRequests.push({
        id,
        fromMemberId,
        toMemberId,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    });
    return id;
  },

  sendChatMessage(
    conversationId: string,
    senderMemberId: string,
    body: string,
  ): string {
    // TODO: client(ChatMessage).create(...) + link to Conversation
    const id = newEntityId("msg");
    const msg: ChatMessage = {
      id,
      conversationId,
      senderMemberId,
      body,
      sentAt: new Date().toISOString(),
    };
    mutate((s) => {
      s.chatMessages.push(msg);
      const dm = s.directConversations.find((c) => c.id === conversationId);
      if (dm) dm.lastMessageAt = msg.sentAt;
      const gr = s.groupConversations.find((c) => c.id === conversationId);
      if (gr) gr.lastMessageAt = msg.sentAt;
    });
    return id;
  },

  joinForum(forumId: string, memberId: string): void {
    mutate((s) => {
      const exists = s.forumMemberships.some(
        (m) => m.forumId === forumId && m.memberId === memberId,
      );
      if (!exists) s.forumMemberships.push({ forumId, memberId });
    });
  },

  createForumThread(thread: Omit<ForumThread, "id" | "replyCount">): string {
    const id = newEntityId("th");
    mutate((s) => {
      s.forumThreads.push({
        ...thread,
        id,
        replyCount: 0,
      });
    });
    return id;
  },

  addForumReply(reply: Omit<ForumReply, "id">): string {
    const id = newEntityId("rep");
    mutate((s) => {
      s.forumReplies.push({ ...reply, id });
      const th = s.forumThreads.find((t) => t.id === reply.threadId);
      if (th) th.replyCount += 1;
    });
    return id;
  },

  openOrGetDirectConversation(
    a: string,
    b: string,
  ): { conversationId: string } {
    const state = loadCommunityState();
    const sorted = [a, b].sort();
    const existing = state.directConversations.find((c) => {
      const p = [...c.participantIds].sort();
      return p[0] === sorted[0] && p[1] === sorted[1];
    });
    if (existing) return { conversationId: existing.id };
    const id = newEntityId("dm");
    mutate((s) => {
      s.directConversations.push({
        id,
        participantIds: sorted,
        lastMessageAt: new Date().toISOString(),
      });
    });
    return { conversationId: id };
  },
};
