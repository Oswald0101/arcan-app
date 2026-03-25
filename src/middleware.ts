// src/middleware.ts
// Refresh session Supabase + protection des routes privées + redirection locale

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes accessibles sans être connecté
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/callback',
  '/auth/consent',
  '/auth/forgot-password',
  '/auth/reset-password',
]

// Routes accessibles uniquement aux admins
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — ne JAMAIS supprimer ces lignes
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  const isApiRoute = pathname.startsWith('/api/')
  const isStaticRoute = pathname.startsWith('/_next/') || pathname.includes('.')

  // Laisser passer les routes statiques et API
  if (isStaticRoute || isApiRoute) return supabaseResponse

  // Pas connecté → rediriger vers login (sauf routes publiques)
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Connecté sur page login/register → rediriger vers accueil
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/accueil'
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
