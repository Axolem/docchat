import { verifyEmail } from "@/lib/api";
import Link from "next/link";

export default async function Page({ params }: { params: { token: string } }) {
	const res = await verifyEmail(params.token);

	return (
		<div className="flex h-screen items-center justify-center">
			{res ? (
				<div>
					<h1 className="text-4xl font-bold">
						Email verified successfully!
					</h1>
					<Link
						href="/signin"
						className="cursor-pointer text-blue-500 hover:underline"
					>
						Sign in
					</Link>
				</div>
			) : (
				<h1 className="text-4xl font-bold">
					Failed to verify email please try again.
				</h1>
			)}
		</div>
	);
}
