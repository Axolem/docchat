"use server";
import { cookies } from "next/headers";
import type { User } from "./types";

export const doLogIn = async (email: string, password: string) => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/signin`, {
		method: "POST",
		body: JSON.stringify({
			email,
			password,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		const data = (await response.json()) as {
			user: User;
			token: string;
		};

		cookies().set("token", data.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24, // One day
			priority: "high",
			sameSite: "strict",
			path: "/",
		});

		return { ...data.user, token: data.token } as User;
	}

	return ((await response.json()) as { message: string }).message;
};

export const doLogOut = async () => {
	cookies().set("token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		priority: "high",
		sameSite: "strict",
		path: "/",
	});

	return true;
};

export const fetchUser = async () => {
	const token = cookies().get("token");

	if (!token) {
		return false;
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/validate/${token.value}`,
		{ next: { revalidate: 3600 * 6 } }
	);

	if (response.ok) {
		return {
			...(await response.json()).user,
			token: token.value,
		} as User;
	}

	cookies().set("token", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		priority: "high",
		sameSite: "strict",
		path: "/",
	});

	return false;
};
