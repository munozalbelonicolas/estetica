import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    '/mi-cuenta/:path*',
    '/profesional/:path*',
    '/admin/:path*',
    '/reservar/:path*',
  ],
};
