import { CommunityLayoutClient } from "./CommunityLayoutClient";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityLayoutClient>{children}</CommunityLayoutClient>;
}
