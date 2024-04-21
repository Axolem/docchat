"use client";
import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

import {
	type UseMutateFunction,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";
import { doLogIn, doLogOut, fetchUser } from "@/lib/auth.api";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
	user: User | null;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	login: UseMutateFunction<
		any,
		Error,
		{
			email: string;
			password: string;
		},
		unknown
	>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();
	const route = useRouter();

	const { mutate: login } = useMutation({
		mutationFn: async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}) => {
			const data = await doLogIn(email, password);

			if (typeof data === "string") {
				throw new Error(data);
			}
			setUser(data);

			return data;
		},
		onError: (error) => {
			toast.error(error.message);
			setLoading(false);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["user"] });
			setLoading(false);
		},
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			setLoading(false);
			toast.success("Logged in successfully");
			route.replace("/", { scroll: true });
		},
	});

	const logout = () => {
		setUser(null);
		clearLocalStorage();
		doLogOut();
		route.replace("/signin");
		toast.success("Logged out successfully");
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const user = localStorage.getItem("user");

		if (user) {
			setUser(JSON.parse(user));
			localStorage.setItem("token", JSON.parse(user).token);
			fetchUser().then((data) => {
				if (data) {
					setUser(data);
					localStorage.setItem("token", data.token);
				} else {
					setUser(null);
				}
			});
			return;
		}
		doLogOut();
	}, []);

	useEffect(() => {
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
			localStorage.setItem("token", user.token);
		} else {
			clearLocalStorage();
		}
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

function clearLocalStorage() {
	localStorage.removeItem("user");
	localStorage.removeItem("token");
}
