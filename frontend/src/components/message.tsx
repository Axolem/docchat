import aiImage from "@/assest/img/ai-profile.jpg";
import Image from "next/image";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import removeMd from "remove-markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bug, Copy, Forward } from "lucide-react";
import { cn } from "@/lib/utils";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { memo, RefObject, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { toast } from "sonner";
import "katex/dist/katex.min.css";

// !DEPRECATED
const Message = ({
	text,
	author,
	uid,
}: {
	text: string;
	author: "user" | "system";
	id: string;
	uid: string;
}) => {
	return (
		<div className="flex px-4 md:px-6">
			<Avatar className="m-3">
				<AvatarFallback>
					<Image
						src={
							author === "system"
								? aiImage
								: `https://picsum.photos/seed/${uid}/200/200`
						}
						alt={`${author}profile image`}
						width={200}
						height={200}
						className="object-cover"
					/>
				</AvatarFallback>
			</Avatar>
			<div
				className={cn(
					"flex flex-col gap-1 p-1 md:p-3 rounded-lg my-2 max-w-full",
					author === "user" ? "shadow-sm" : ""
				)}
			>
				<h4 className="scroll-m-20 text-base font-semibold tracking-tight">
					{author === "system" ? "Doc Chat" : "You"}
				</h4>
				<p className="text-pretty text-base leading-7 [&:not(:first-child)]:mt-0 md:[&:not(:first-child)]:mt-2">
					{text}
				</p>
				<Toolbar text={text} />
			</div>
		</div>
	);
};

const MessageV2 = ({
	text,
	author,
	uid,
}: {
	text: string;
	author: "user" | "system";
	id: string;
	uid: string;
}) => {
	const ref = useRef<RefObject<SyntaxHighlighter>>(null);
	return (
		<div className="flex px-4 md:px-6">
			<div className="w-1/6">
				<Avatar className="m-3">
					<AvatarFallback>
						<Image
							src={
								author === "system"
									? aiImage
									: `https://picsum.photos/seed/${uid}/200/200`
							}
							alt={`${author}profile image`}
							width={200}
							height={200}
							className="object-cover"
						/>
					</AvatarFallback>
				</Avatar>
			</div>
			<div
				className={cn(
					"flex flex-col gap-1 p-1 md:p-3 rounded-lg my-2 w-5/6",
					author === "user" ? "shadow-sm" : ""
				)}
			>
				<h4 className="scroll-m-20 text-base font-semibold tracking-tight">
					{author === "system" ? "Doc Chat" : "You"}
				</h4>
				<Markdown
					className={cn("max-w-full")}
					remarkPlugins={[
						[remarkGfm, { singleTilde: false }],
						remarkMath,
					]}
					rehypePlugins={[rehypeKatex]}
					components={{
						code(props) {
							const { children, className, ...rest } = props;
							const match = /language-(\w+)/.exec(
								className || ""
							);
							return match ? (
								<SyntaxHighlighter
									ref={ref as any}
									{...rest}
									PreTag="div"
									children={String(children).replace(
										/\n$/,
										""
									)}
									language={match[1]}
									style={darcula}
									className={cn(className, "rounded-md")}
								/>
							) : (
								<code
									{...rest}
									onCopy={() => {
										navigator.clipboard.writeText(
											children as string
										);
										toast("Copied to clipboard");
									}}
									className={cn(
										className,
										"text-pretty dark:text-[#f8f8f2] dark:bg-[#282a36] p-1 rounded-md"
									)}
								>
									{children}
								</code>
							);
						},
						p(props) {
							return (
								<p
									className="text-pretty text-base leading-7 [&:not(:first-child)]:mt-0 md:[&:not(:first-child)]:mt-2"
									{...props}
								/>
							);
						},
						h1(props) {
							return (
								<h1
									className="mt-3 text-pretty text-2xl font-bold"
									{...props}
								/>
							);
						},
						h2(props) {
							return (
								<h2
									className="mt-2 text-pretty text-xl font-bold"
									{...props}
								/>
							);
						},
						h3(props) {
							return (
								<h3
									className="mt-2 text-pretty text-lg font-bold"
									{...props}
								/>
							);
						},
						h4(props) {
							return (
								<h4
									className="mt-1 text-pretty text-base font-bold"
									{...props}
								/>
							);
						},
						h5(props) {
							return (
								<h5
									className="mt-1 text-pretty text-sm font-bold"
									{...props}
								/>
							);
						},
						h6(props) {
							return (
								<h6
									className="mt-1 text-pretty text-xs font-bold"
									{...props}
								/>
							);
						},
						ol(props) {
							return (
								<ol
									className="list-inside list-decimal"
									{...props}
								/>
							);
						},
						ul(props) {
							return (
								<ul
									className="mt-2 list-inside list-disc"
									{...props}
								/>
							);
						},
						li(props) {
							return (
								<li
									className="mt-2 text-pretty text-base leading-7 [&:not(:first-child)]:mt-0 md:[&:not(:first-child)]:mt-2"
									{...props}
								/>
							);
						},
						a(props) {
							return (
								<a
									className="text-primary underline"
									{...props}
								/>
							);
						},
						blockquote(props) {
							return (
								<blockquote
									className="border-l-4 border-primary pl-2"
									{...props}
								/>
							);
						},
						hr(props) {
							return (
								<hr
									className="border-t-2 border-primary"
									{...props}
								/>
							);
						},
						table(props) {
							return (
								<table
									className="table-auto"
									{...props}
								/>
							);
						},
						thead(props) {
							return (
								<thead
									className="bg-primary text-white"
									{...props}
								/>
							);
						},
						tbody(props) {
							return (
								<tbody
									className="bg-secondary"
									{...props}
								/>
							);
						},
						tr(props) {
							return (
								<tr
									className="border-b border-primary"
									{...props}
								/>
							);
						},
						th(props) {
							return (
								<th
									className="p-2"
									{...props}
								/>
							);
						},
						td(props) {
							return (
								<td
									className="p-2"
									{...props}
								/>
							);
						},
					}}
				>
					{text}
				</Markdown>
				<Toolbar text={text} />
			</div>
		</div>
	);
};

const MessageNew = memo(MessageV2);

export default MessageNew;

const Toolbar = ({ text }: { text: string }) => {
	const handleCopy = () => {
		navigator.clipboard.writeText(removeMd(text));
		toast("Copied to clipboard");
	};

	const handleShare = () => {
		navigator.share({ text });
	};

	const handleReport = () => {
		// TODO! Implement a report feature
		alert("Feature not implemented yet!");
	};

	return (
		<div className="mx-auto flex w-min justify-center gap-4">
			<Copy
				className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary"
				onClick={handleCopy}
			/>
			<Forward
				className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary"
				onClick={handleShare}
			/>
			<Bug
				className="h-4 w-4 cursor-pointer hover:h-5 hover:w-5 hover:text-primary/70 active:text-secondary"
				onClick={handleReport}
			/>
		</div>
	);
};
