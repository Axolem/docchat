"use client";

import { ArrowRight, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default () => {
	const [loading, setLoading] = useState(false);
	const route = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setLoading(true);
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirm-password") as string;

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			setLoading(false);
			return;
		}

		// if (password.length < 8) {
		//     toast.error("Password must be at least 8 characters long");
		//     setLoading(false);
		//     return;
		// }

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
			{
				method: "POST",
				body: JSON.stringify({
					email: formData.get("email"),
					password: formData.get("password"),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (response.ok) {
			toast.success("Account created successfully", {
				description: "Please check your email to verify your account",
			});
			setLoading(false);
			route.replace("/signin");
			return;
		}

		const data = await response.json();
		toast.error(data.message);
		setLoading(false);
	};

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="mx-auto w-3/4 max-w-md rounded-none p-4 shadow-input backdrop-blur-lg md:w-full md:rounded-2xl md:p-8">
				<h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
					Welcome to DocChat
				</h2>
				<p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
					Sign up to get started with your account
				</p>

				<form
					className="my-8"
					onSubmit={handleSubmit}
				>
					{/* <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <Input id="firstname" placeholder="Tyler" type="text" />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input id="lastname" placeholder="Durden" type="text" />
                    </LabelInputContainer>
                </div> */}
					<LabelInputContainer className="mb-4">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							autoCapitalize="none"
							autoFocus
							placeholder="realemail@domain.com"
							type="email"
							name="email"
							autoComplete="email"
							required
						/>
					</LabelInputContainer>
					<LabelInputContainer className="mb-4">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							placeholder="•••••••••••••"
							type="password"
							name="password"
							autoComplete="new-password"
							required
						/>
					</LabelInputContainer>
					<LabelInputContainer className="mb-8">
						<Label htmlFor="twitterpassword">
							Your twitter password
						</Label>
						<Input
							id="twitterpassword"
							placeholder="•••••••••••••"
							type="password"
							name="confirm-password"
							autoComplete="new-password"
							required
						/>
					</LabelInputContainer>

					<button
						className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-primary to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
						type="submit"
						disabled={loading}
					>
						<div className="flex items-center justify-center gap-4 text-center">
							{loading ? "Creating that account..." : "Sign up"}
							{loading ? (
								<Loader className="h-5 w-5 animate-spin" />
							) : (
								<ArrowRight className="h-5 w-5" />
							)}
						</div>
						<BottomGradient />
					</button>

					<div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
				</form>
				<Link
					href="/signin"
					className="w-100 text-center text-sm text-primary dark:text-zinc-500"
				>
					Already have an account? Sign in
				</Link>
			</div>
		</div>
	);
};

const BottomGradient = () => {
	return (
		<>
			<span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
			<span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
		</>
	);
};

const LabelInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className={cn("flex flex-col space-y-2 w-full", className)}>
			{children}
		</div>
	);
};
