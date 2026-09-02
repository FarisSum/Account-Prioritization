import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/data";
import { generateRecommendation } from "@/lib/recommend";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // research + synthesis can take ~1 min

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
    const recommendation = await generateRecommendation(domain);
    return NextResponse.json(
      { ok: recommendation.status === "completed", recommendation },
      { status: recommendation.status === "completed" ? 200 : 502 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
