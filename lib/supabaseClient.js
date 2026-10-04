"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Next.js tries to prerender every page once at build time, even ones
  // marked force-dynamic, and createBrowserClient throws immediately if
  // given empty strings — so before the Supabase env vars are set in
  // Vercel, that prerender pass crashed the whole build. Falling back to
  // harmless placeholders keeps the build green; once the real env vars
  // are set, this always resolves to the real values at runtime anyway.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
}
