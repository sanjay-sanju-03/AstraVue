import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "earth from space";
  
  const baseUrl = process.env.NASA_API_BASE || "https://images-api.nasa.gov";
  const url = `${baseUrl}/search?q=${encodeURIComponent(q)}&media_type=image&page=1&page_size=8`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from NASA API" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
