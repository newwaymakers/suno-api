import { NextResponse, NextRequest } from "next/server";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const songIds = url.searchParams.get("ids");

    // ✅ 요청 시점에만 로딩
    const { sunoApi } = await import("@/lib/SunoApi");

    // ✅ sunoApi는 "함수"이므로 호출해서 인스턴스를 얻어야 함
    const api = await sunoApi(); // get은 쿠키 없이도 되는 엔드포인트면 이대로 OK

    let audioInfo: any;
    if (songIds && songIds.length > 0) {
      const idsArray = songIds.split(",");
      audioInfo = await api.get(idsArray);
    } else {
      audioInfo = await api.get();
    }

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
