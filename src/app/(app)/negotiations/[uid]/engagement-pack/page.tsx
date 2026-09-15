"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { EngagementPackWorkspace } from "@/modules/negotiation/components/EngagementPackWorkspace";

interface EngagementPackPageProps {
  params: Promise<{ uid: string }>;
}

export default function EngagementPackPage({ params }: EngagementPackPageProps) {
  const { uid } = use(params);
  const router = useRouter();

  return (
    <EngagementPackWorkspace
      negotiationUid={uid}
      open={true}
      onClose={() => router.push(`/negotiations/${uid}`)}
      mode="firm"
    />
  );
}
