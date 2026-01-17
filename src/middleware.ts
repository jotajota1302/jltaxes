import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Handle i18n routing first (creates response with locale)
  const response = handleI18nRouting(request);

  // Step 2: Update Supabase session (refreshes tokens via cookies)
  await updateSession(request, response);

  // Future: Add protected route logic here
  // const { user } = await updateSession(request, response);
  // if (protectedRoutes.includes(pathname) && !user) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
