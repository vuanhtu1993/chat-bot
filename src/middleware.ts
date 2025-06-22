import { NextResponse } from 'next/server';

export async function middleware() {
  return NextResponse.next();
}

// Specify paths to match
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
