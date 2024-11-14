import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
    '/mybookings(.*)',
    '/book/(.*)'
])

const isAdminRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req: NextRequest) => {
    const { userId, redirectToSignIn, sessionClaims } = auth()

    // Redirect to sign-in if the user is not authenticated and trying to access protected or admin routes
    if (!userId && (isProtectedRoute(req) || isAdminRoute(req))) {
        return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Check if the user is an admin
    if (userId && isAdminRoute(req)) {
        if (sessionClaims?.metadata.role === 'admin') {
            return NextResponse.next()
        } else {
            return new Response(`You are not authorized`, { status: 403 }) // Changed status to 403 for forbidden access
        }
    }

    return NextResponse.next()
})