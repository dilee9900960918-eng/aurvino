import { auth } from "@/auth";

export const proxy = auth((request) => {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !request.auth
  ) {
    return Response.redirect(
      new URL("/admin/login", request.nextUrl)
    );
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};