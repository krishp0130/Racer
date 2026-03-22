import { ThreadDetailClient } from "./ThreadDetailClient";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ forumId: string; threadId: string }>;
}) {
  const { forumId, threadId } = await params;
  return <ThreadDetailClient forumId={forumId} threadId={threadId} />;
}
