import { Button, Heading, Html, Link } from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
	email,
	token,
}: {
	email: string;
	token: string;
}) {
	return (
		<Html>
			<Heading as="h1">Welcome to DocChat! 🎉</Heading>
			<p>Please click the button below to verify your email: {email}</p>
			<Button
				href={`${process.env["FRONTEND_URL"]!}/verify/${token}`}
				style={{
					background: "#000",
					color: "#fff",
					padding: "12px 20px",
				}}
			>
				Click to verify your email
			</Button>

			<p>
				If the button above does not work, you can also copy and paste
				the following link into your browser:
			</p>
			<p>
				<Link href={`${process.env["FRONTEND_URL"]!}/verify/${token}`}>
					{`${process.env["FRONTEND_URL"]!}/verify/${token}`}
				</Link>
			</p>
		</Html>
	);
}
