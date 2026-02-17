import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, make_instrumental, model, wait_audio } = body;

    const { DEFAULT_MODEL, sunoApi } = await import("@/lib/SunoApi");
    const cookieStr = (await cookies()).toString();

    const audioInfo = await (await sunoApi(cookieStr)).generate(
      prompt,
      Boolean(make_instrumental),
      model || DEFAULT_MODEL,
      Boolean(wait_audio)
    );

    return new NextResponse(JSON.stringify(audioInfo), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error generating audio:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
