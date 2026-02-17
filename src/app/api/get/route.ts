import { NextResponse, NextRequest } from "next/server";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const songIds = url.searchParams.get("ids");

    // 🔐 Vercel 환경변수에서 쿠키 읽기
    const cookieStr = process.env.SUNO_COOKIE;

    if (!cookieStr) {
      return new NextResponse(
        JSON.stringify({ error: "SUNO_COOKIE is not set in environment variables" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 요청 시점에만 로딩
    const { sunoApi } = await import("@/lib/SunoApi");

    // 쿠키 전달하여 API 인스턴스 생성
    const api = await sunoApi(cookieStr);

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
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
