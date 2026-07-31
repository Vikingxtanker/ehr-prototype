import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Authentication is handled entirely client-side for now (demo login
  // stored in localStorage via `@/lib/auth/demo-auth`). This middleware is a
  // no-op until a real backend (e.g. Supabase) is connected.
  return NextResponse.next({
    request,
  });
}
