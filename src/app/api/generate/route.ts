import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUNO_URL = "https://studio-api.prod.suno.com/api/generate/v2-web/";

function json(resBody: any, status = 200) {
  return new NextResponse(JSON.stringify(resBody), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export async function POST(req: NextRequest) {
  try {
    // ✅ 내부 호출 보호 (GitHub Actions용)
    const apiKey = req.headers.get("x-api-key");
    if (!process.env.INTERNAL_API_KEY || apiKey !== process.env.INTERNAL_API_KEY) {
      return json({ error: "Unauthorized" }, 401);
    }

    const bearer = process.env.SUNO_BEARER_TOKEN;
    const deviceId = process.env.SUNO_DEVICE_ID;
    const browserToken = process.env.SUNO_BROWSER_TOKEN;

    if (!bearer || !deviceId || !browserToken) {
      return json(
        { error: "Missing env: SUNO_BEARER_TOKEN / SUNO_DEVICE_ID / SUNO_BROWSER_TOKEN" },
        500
      );
    }

    // ✅ 클라이언트가 보내는 payload를 그대로 Suno에 전달
    // 최소 prompt만 있어도 동작하는 경우가 많지만, 실제 필드는 Suno가 바꿀 수 있음.
    const payload = await req.json();

    const upstream = await fetch(SUNO_URL, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${bearer}`,
        "device-id": deviceId,
        "browser-token": JSON.stringify({ token: browserToken }),
        "content-type": "application/json",
        "accept": "*/*",
        "origin": "https://suno.com",
        "referer": "https://suno.com/",
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return json(
      {
        ok: upstream.ok,
        status: upstream.status,
        data,
      },
      upstream.ok ? 200 : upstream.status
    );
  } catch (e: any) {
    console.error(e);
    return json({ error: "Internal server error", detail: String(e) }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
