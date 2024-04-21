import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const authToken = request.cookies.get("token");
	const url = request.nextUrl.clone();

	if (!authToken && request.nextUrl.pathname === "/") {
		url.pathname = "/signin";
		return NextResponse.redirect(url);
	}

	if (
		authToken &&
		(request.nextUrl.pathname === "/signin" ||
			request.nextUrl.pathname === "/signup")
	) {
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/signin", "/signup"],
};
