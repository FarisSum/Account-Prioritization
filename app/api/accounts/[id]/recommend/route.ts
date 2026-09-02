import { after, NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/data";
import { createPendingRecommendation, runRecommendation } from "@/lib/recommend";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // research + synthesis run in after()

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const domain = decodeURIComponent(id);

  if (!supabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured (set NEXT_PUBLIC_SUPABASE_* in .env.local)." },
      { status: 503 },
    );
  }

  try {
    const { id: recId, brief } = await createPendingRecommendation(domain);

    // Runs after the response is sent — survives client navigation / tab close.
    after(async () => {
      await runRecommendation(recId, domain, brief);
    });

    return NextResponse.json({ ok: true, status: "pending", id: recId }, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
