import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";         // ✅ Node 런타임 강제
export const dynamic = "force-dynamic";  // ✅ 정적 수집 방지 성격

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const clipId = url.searchParams.get("id");
    if (!clipId) {
      return new NextResponse(JSON.stringify({ error: "Missing parameter id" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ✅ 빌드 시점이 아니라 “요청 시점”에만 로딩
    const { sunoApi } = await import("@/lib/SunoApi");

    const audioInfo = await (await sunoApi()).getClip(clipId);
    return new NextResponse(JSON.stringify(audioInfo), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
