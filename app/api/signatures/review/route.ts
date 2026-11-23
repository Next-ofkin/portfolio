import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { approve, checkToken, reject, signaturesOpen, validId } from "@/lib/signatures";

// Approve or delete a signature from the review page. The form posts here (a GET from the email link only shows
// the page, so mail scanners that open links can't approve anything).
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const id = form?.get("id");
  const token = form?.get("t");
  const action = form?.get("action");
  const back = (done: string) => NextResponse.redirect(new URL(`/lab/review?done=${done}`, request.url), 303);

  if (!signaturesOpen() || !validId(id) || !checkToken(id, token)) return back("invalid");
  try {
    if (action === "approve") {
      const moved = await approve(id);
      revalidateTag("signatures", { expire: 0 });
      return back(moved ? "approved" : "missing");
    }
    if (action === "reject") {
      await reject(id);
      revalidateTag("signatures", { expire: 0 });
      return back("removed");
    }
  } catch (e) {
    console.error("Signature review failed", e);
    return back("error");
  }
  return back("invalid");
}
