import { detectImageMime } from "@/lib/pitch";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Admin: serve a pitch sketch image with the type detected from its bytes.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!UUID_RE.test(id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data } = await supabase
    .from("pitch_submissions")
    .select("sketch")
    .eq("id", id)
    .maybeSingle();

  // PostgREST returns bytea as "\x<hex>".
  const hex = typeof data?.sketch === "string" ? data.sketch.replace(/^\\x/, "") : "";
  const bytes = new Uint8Array(Buffer.from(hex, "hex"));
  const mime = bytes.length ? detectImageMime(bytes) : null;
  if (!mime) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mime,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
    },
  });
}
