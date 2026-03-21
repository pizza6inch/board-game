import { NextRequest, NextResponse } from "next/server";

// Auth protection is handled client-side in each protected page.
// This middleware only handles non-auth concerns (e.g. future i18n, headers).
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
