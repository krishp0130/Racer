import { MatchmakerChat } from "@/components/matchmaker/MatchmakerChat";

export default async function MatchmakerPage({
  searchParams,
}: {
  searchParams: Promise<{ oauth?: string }>;
}) {
  const sp = await searchParams;
  const oauthConfigHint = sp.oauth === "missing";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8 md:px-8 md:py-10">
      <MatchmakerChat
        variant="full"
        oauthConfigHint={oauthConfigHint}
      />
    </div>
  );
}
