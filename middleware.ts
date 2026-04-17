import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Protected routes
  const isAgentRoute = pathname.startsWith('/agent')
  const isAdminRoute = pathname.startsWith('/admin')
  const isUserRoute = pathname.startsWith('/saved') || pathname.startsWith('/inquiries')

  if (isAgentRoute || isAdminRoute || isUserRoute) {
    if (!user) {
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Role-based protection
    const userRole = user.user_metadata?.role || 'USER'

    if (isAdminRoute && userRole !== 'ADMIN') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (isAgentRoute && !pathname.startsWith('/agent/pending-approval') && !pathname.startsWith('/agent/register')) {
      if (userRole !== 'AGENT' && userRole !== 'ADMIN') {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      // Check agent approval status via API
      try {
        const checkRes = await fetch(new URL('/api/auth/check-agent', request.url), {
          headers: {
            cookie: request.headers.get('cookie') || ''
          }
        });
        
        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.role === 'AGENT' && !data.isApproved) {
            url.pathname = '/agent/pending-approval'
            return NextResponse.redirect(url)
          }
        }
      } catch (error) {
        console.error('Middleware agent check failed:', error);
      }
    }
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
