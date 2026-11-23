import { Suspense } from "react";
import { getApproved, signaturesOpen } from "@/lib/signatures";
import { SignatureWall } from "./SignatureWall";

async function Wall() {
  const data = await getApproved();
  return <SignatureWall approved={data.ok ? data.signatures : []} open={signaturesOpen()} />;
}

export function SignatureSection() {
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-[34rem] animate-pulse rounded-[1.5rem] bg-surface" />}>
      <Wall />
    </Suspense>
  );
}
