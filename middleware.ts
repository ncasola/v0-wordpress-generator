import { stackServerApp } from '@/stack/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  
  // Si no hay usuario y no estamos en una ruta de handler, redirigir al login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/handler') &&
    !request.nextUrl.pathname.startsWith('/_next')
  ) {
    // No hay usuario, redirigir a la página de login
    const url = request.nextUrl.clone()
    url.pathname = '/handler/sign-in'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}