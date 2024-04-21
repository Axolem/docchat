"use client";
import Message from "@/components/message";
import { Button } from "@/components/ui/button";
import { Ellipsis, Send } from "lucide-react";
import { getAnswerV2 } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth";

import FilesList from "@/components/files";
import ThemeToggle from "@/components/theme-selector";
import FileDialog from "@/components/file-dialog";

const Page = () => {
	const { user } = useAuth();
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<
		{ id: string; text: string; author: "user" | "system" }[]
	>([
		{
			id: "1",
			text: "Hi there! I'm Doc Chat, your personal document assistant. How can I help you today?",
			author: "system",
		},
	]);

	// const { mutateAsync } = useMutation({
	// 	mutationFn: (_message: string) => getAnswer(_message),
	// 	mutationKey: ["getAnswer"],
	// });

	const { mutateAsync: mutateAsyncV2 } = useMutation({
		mutationFn: (_message: string) =>
			getAnswerV2(
				_message,
				messages.map((m) => ({ text: m.text, user: m.author }))
			),
		mutationKey: ["getAnswer"],
		onError(error) {
		},
	});

	const sendMessage = () => {
		if (message.trim() === "") return;
		setIsLoading(true);

		setMessages((p) => [
			...p,
			{
				author: "user",
				id: Date.now().toString(),
				text: message,
			},
		]);

		mutateAsyncV2(message)
			.then((data) => {
				setMessages((p) => [
					...p,
					{
						author: "system",
						id: Date.now().toString(),
						...data,
					},
				]);
			})
			.finally(() => setIsLoading(false));

		setMessage("");
	};

	const ref = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		ref.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	return (
		<div className="relative w-screen">
			<div className="no-scrollbar mx-auto mb-24 flex w-full flex-col overflow-x-auto overflow-y-scroll scroll-smooth md:w-2/3">
				{messages.map((message) => (
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					<Message
						key={message.id}
						{...message}
						uid={user?._id!}
					/>
				))}
				<div ref={ref} />
				{isLoading && (
					<Ellipsis className="my-5 ml-28 h-6 w-6 animate-ping" />
				)}
			</div>

			<div className="fixed bottom-2 left-14 right-2 flex flex-col gap-1 bg-background pt-3 md:bottom-0 md:left-0 md:right-0 md:h-1/6 md:py-3">
				<FileDialog />
				<Input
					type="text"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							sendMessage();
						}
					}}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					icon={
						<Button
							variant="outline"
							size="icon"
							onClick={sendMessage}
							type="submit"
							accessKey="Enter"
							disabled={isLoading}
							// When i press enter, it should send the message
						>
							<Send />
						</Button>
					}
					multiple
					placeholder="Type a message..."
					autoFocus
					autoCorrect="on"
					autoCapitalize="sentences"
					iconClassName="flex items-center gap-2 md:mx-auto md:w-1/2 md:gap-4"
				/>
			</div>

			<div className="fixed bottom-2 left-2 flex w-1/5 flex-col gap-2">
				<FilesList />
				<ThemeToggle />
			</div>
		</div>
	);
};

export default Page;
