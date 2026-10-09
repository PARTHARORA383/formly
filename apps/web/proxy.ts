import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const loggedIn = request.cookies.has("refreshToken")
  const { pathname } = request.nextUrl

  if (loggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}