import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const searchParams = request.nextUrl.searchParams
    const hasAuthToken = searchParams.has('code') || searchParams.has('token_hash') || searchParams.has('access_token')

    const publicPaths = [
        '/', '/login', '/landing', '/about', '/services', '/contact',
        '/rachat-credits', '/pret', '/fraude-bancaire', '/legal',
        '/mentions-legales', '/politique-confidentialite', '/cgu',
        '/admin', '/api'
    ]

    const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

    if (!user && !isPublic && !hasAuthToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (local images)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
