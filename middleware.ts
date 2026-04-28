import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET no está configurado. Agrega la variable de entorno antes de iniciar.');
}
const secretKey = new TextEncoder().encode(jwtSecret);

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/admin'];

// Rutas de autenticación (usuarios autenticados no deberían acceder)
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener token de la cookie
  const token = request.cookies.get('placerlux-token')?.value;

  // Verificar si la ruta actual está protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Si es una ruta protegida
  if (isProtectedRoute) {
    if (!token) {
      // No hay token, redirigir a login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verificar token
      const { payload } = await jwtVerify(token, secretKey);
      
      // Si es ruta de admin, verificar rol
      if (pathname.startsWith('/admin')) {
        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      // Token inválido, eliminar cookie y redirigir
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('placerlux-token');
      return response;
    }
  }

  // Si es una ruta de autenticación y el usuario ya está autenticado
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, secretKey);
      // Usuario autenticado intentando acceder a login/register, redirigir a dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (_error) {
      // Token inválido, permitir acceso a la ruta de auth
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
