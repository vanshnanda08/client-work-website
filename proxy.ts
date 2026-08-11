import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every matched request: refreshes the Supabase auth cookie and
 * gates the app routes.
 *
 * NOTE ON THE FILENAME. In Next.js 16 the `middleware.ts` convention is
 * DEPRECATED and renamed to `proxy.ts`, with the export renamed from
 * `middleware` to `proxy`. Every Supabase guide still says `middleware.ts`;
 * following them here produces a file Next silently ignores, so sessions never
 * refresh and users get logged out at random.
 * Ref: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */

/** Routes a signed-out visitor may see. */
const PUBLIC_PATHS = ["/login", "/signup", "/reset-password", "/auth"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Must be getUser(), not getSession(): getUser() revalidates the token with
  // Supabase, whereas getSession() trusts whatever cookie the browser sent.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Send them back where they were headed once signed in.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return this exact response object so refreshed auth cookies
  // survive. Building a new NextResponse here drops them.
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — matching those would
     * run an auth check per asset for no benefit.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
