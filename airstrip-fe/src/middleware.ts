import { currentUserJwtKey } from '@/constants';
import { appPrefix, Links } from '@/utils/misc/links';
import type { NextRequest } from 'next/server';

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
    (request.nextUrl.pathname.startsWith(Links.login()) ||
      request.nextUrl.pathname.startsWith(Links.register()))
  ) {
    return Response.redirect(new URL(Links.appHome(), request.url));
  } else if (request.nextUrl.pathname.startsWith(Links.publicInvites())) {
    // Redirect to register page with the invite details to prefill the form.
    const inviteToken = request.nextUrl.pathname.split('/')[2] || '';
    const email = request.nextUrl.searchParams.get('email') || '';
    return Response.redirect(
      new URL(
        `${Links.register()}?inviteToken=${inviteToken}&email=${encodeURIComponent(email)}&redirectTo=${Links.invites()}`,
        request.url,
      ),
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
