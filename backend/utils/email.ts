import { Resend } from "resend";
import EmailTemplate from "../emails";

const resend = new Resend(process.env["RESEND_API_KEY"]);

export const sendEmail = async (email: string, link: string) => {
	const { data, error } = await resend.emails.send({
		from:
			process.env.NODE_ENV === "production"
				? "DocChat <docchat@axole.online>"
				: "onboarding@resend.dev",
		to: [email],
		subject: "Email verification | Welcome to DocChat! 🎉",
		react: EmailTemplate({ email, token: link }),
	});

	if (error) {
		throw new Error(error.message);
	}

	return data;
};
