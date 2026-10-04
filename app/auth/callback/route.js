import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// Handles the redirect back from Supabase email-confirmation links (and any
// OAuth provider added later), exchanging the auth code for a session cookie.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/partner.html";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/partner/login?authError=1`);
}
