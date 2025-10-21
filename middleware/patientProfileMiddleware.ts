import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Patient from "@/models/Patient";

const isProtectedRoute = createRouteMatcher([
  '/user(.*)',
  '/patient-registration(.*)',
  '/staff(.*)',
  '/doctor(.*)',
  '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Only run on protected routes
    if (!isProtectedRoute(req)) {
      return;
    }

    // Allow public routes
    const { userId } = await auth();
    if (!userId) {
      return;
    }

    // Skip middleware for API routes and other assets
    if (req.nextUrl.pathname.startsWith('/api') || 
        req.nextUrl.pathname.startsWith('/_next') || 
        req.nextUrl.pathname.startsWith('/static')) {
      return;
    }

    try {
      // Validate request URL
      if (!req.url || !req.nextUrl) {
        console.error('Invalid request URL');
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Connect to MongoDB
      await connectMongo();

      // Check patient profile
      const patient = await Patient.findOne({ userId });
      const currentPath = req.nextUrl.pathname;

      // Define protected paths that require profile
      const requiresProfile = ![
        '/patient-registration',
        '/api',
        '/_next',
        '/static',
        '/sign-in',
        '/sign-up'
      ].some(path => currentPath.startsWith(path));

      // Handle different scenarios
      switch (true) {
        // If on registration page but has profile, redirect to profile
        case currentPath === '/patient-registration' && patient !== null:
          return NextResponse.redirect(new URL('/user/profile', req.url));

        // If on profile page but no profile, redirect to registration
        case currentPath === '/user/profile' && patient === null:
          return NextResponse.redirect(new URL('/patient-registration', req.url));

        // For protected pages, ensure user has profile
        case requiresProfile && patient === null:
          return NextResponse.redirect(new URL('/patient-registration', req.url));

        default:
          return NextResponse.next();
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      // On error, redirect to safe page
      return NextResponse.redirect(new URL('/', req.url));
    }
});