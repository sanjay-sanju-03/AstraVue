import { NextRequest, NextResponse } from "next/server";

// Only NASA's own image hosts may be proxied. This route is used to render
// NASA images in the browser, so there is no reason to relay arbitrary hosts.
const ALLOWED_HOST_SUFFIXES = [
  "nasa.gov",
  "nasa.gov.",
  "images-assets.nasa.gov",
  "images-api.nasa.gov",
];

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Cap relayed responses so the route cannot be used to pull arbitrary large files.
const MAX_BYTES = 25 * 1024 * 1024;

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith("." + suffix)
  );
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Malformed url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname)) {
    return NextResponse.json(
      { error: "Host not allowed" },
      { status: 403 }
    );
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { Accept: "image/*" },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!ALLOWED_CONTENT_TYPES.includes(contentType.split(";")[0].trim().toLowerCase())) {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}