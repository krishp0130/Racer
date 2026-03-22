import { ForumDetailClient } from "./ForumDetailClient";

export default async function ForumDetailPage({
  params,
}: {
  params: Promise<{ forumId: string }>;
}) {
  const { forumId } = await params;
  return <ForumDetailClient forumId={forumId} />;
}
