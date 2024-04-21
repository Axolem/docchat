"use client";

import { ArrowRight, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth";
import { useRef } from "react";

import type React from "react";

export default function SignIn() {
	const formRef = useRef<HTMLFormElement>(null);
	const { login, loading } = useAuth();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		try {
			login({
				email: formData.get("email") as string,
				password: formData.get("password") as string,
			});
		} catch (error) {
			console.error(error);
			toast.error("An error occurred");
		}
	};
	return (
		<form
			className="my-8"
			onSubmit={handleSubmit}
			ref={formRef}
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
					autoComplete="current-password"
					required
				/>
			</LabelInputContainer>

			<button
				className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-primary to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
				type="submit"
				disabled={loading}
			>
				<div className="flex items-center justify-center gap-4 text-center">
					{loading ? "Checking those..." : "Sign in"}
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
	);
}

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
