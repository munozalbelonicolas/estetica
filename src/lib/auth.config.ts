import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/registro',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Allow exploration of public pages, booking wizard, demo admin and professional modules
      const isPublicRoute = [
        '/',
        '/login',
        '/registro',
        '/recuperar-password',
        '/tratamientos',
        '/profesionales',
        '/resultados',
        '/nosotros',
        '/faq',
        '/contacto',
        '/reservar',
        '/profesional',
        '/admin',
        '/mi-cuenta',
      ].some(
        (route) =>
          nextUrl.pathname === route ||
          nextUrl.pathname.startsWith(`${route}/`)
      );

      if (isPublicRoute) return true;
      if (!isLoggedIn) return false;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
