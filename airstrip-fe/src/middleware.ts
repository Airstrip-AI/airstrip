import type { NextRequest } from 'next/server';
import { appPrefix, Links } from '@/utils/misc/links';
import { currentUserJwtKey } from '@/hooks/user';

export function middleware(request: NextRequest) {
  const currentUserJwt = request.cookies.get(currentUserJwtKey);

  if (!currentUserJwt && request.nextUrl.pathname.startsWith(appPrefix)) {
    return Response.redirect(
      new URL(
        `${Links.login()}?redirectTo=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  } else if (
    currentUserJwt &&
    request.nextUrl.pathname.startsWith(Links.login())
  ) {
    return Response.redirect(new URL(Links.appHome(), request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
