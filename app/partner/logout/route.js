import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

// Not linked from the UI yet (prototype markup is untouched) — visit
// /partner/logout directly to sign out during testing.
export async function GET(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/partner/login", request.url));
}
