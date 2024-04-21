import Link from "next/link";
import SignIn from "@/components/forms/sign-in";
import { Suspense } from "react";

export default () => {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="mx-auto w-3/4 max-w-md rounded-none p-4 shadow-input backdrop-blur-lg md:w-full md:rounded-2xl md:p-8">
				<h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
					Welcome back
				</h2>
				<p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
					Sign in to your account
				</p>

				<Suspense fallback={<div>Loading...</div>}>
					<SignIn />
				</Suspense>

				<Link
					href="/signup"
					className="w-100 text-center text-sm text-primary dark:text-zinc-500"
				>
					New here? Sign up
				</Link>
			</div>
		</div>
	);
};
