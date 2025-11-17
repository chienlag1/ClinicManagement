import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Bỏ qua static files và API công khai
    '/((?!.*\\..*|_next).*)',
    '/',
    // Bỏ qua API clinics khỏi authentication
    '/((?!api/clinics|api/health).*)',
  ],
};
