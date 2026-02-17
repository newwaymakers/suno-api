import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clip_id } = body;

    if (!clip_id) {
      return new NextResponse(JSON.stringify({ error: "Clip id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ✅ 요청 시점에만 로딩
    const { sunoApi } = await import("@/lib/SunoApi");
    const cookieStr = (await cookies()).toString();

    const audioInfo = await (await sunoApi(cookieStr)).concatenate(clip_id);

    return new NextResponse(JSON.stringify(audioInfo), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error concatenating audio:", error?.response?.data || error);

    if (error?.response?.status === 402) {
      return new NextResponse(JSON.stringify({ error: error.response.data.detail }), {
        status: 402,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
