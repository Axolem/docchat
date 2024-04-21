import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MultiStepLoaderDemo } from "@/components/loading";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { type FormEvent, memo, useRef, useState } from "react";
import { useAuth } from "@/providers/auth";

function FileDialog() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [duration, setDuration] = useState(2000);
	const ref = useRef<HTMLFormElement>(null);
	const { user } = useAuth();

	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: async (e: FormEvent<HTMLFormElement>) => handleSubmit(e),
		mutationKey: ["files", "uploadFiles"],
		onSuccess(_) {
			// toast.success("Files uploaded successfully")
			queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError(error) {
			toast.error(error.message);
			queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onSettled() {
			queryClient.invalidateQueries({ queryKey: ["files"] });
			setLoading(false);
		},
	});

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setOpen(false);

		if (!ref.current) return toast.error("Something went wrong! #1");
		const form = new FormData(ref.current);

		const files = form.getAll("files") as File[];
		const totalSize =
			files.reduce((acc, file) => acc + file.size, 0) / 7000;

		setDuration(totalSize ? totalSize : 2000);
		// setDuration(form.getAll("files").length * 50)

		const response = await fetch(ref.current.action, {
			method: ref.current.method,
			body: form,
			headers: {
				token: localStorage.getItem("token") ?? "",
			},
		});

		if (response.ok) {
			toast.success("Files uploaded successfully");
			return;
		}

		const data = await response.text();
		toast.error(data || "Something went wrong! #2");
	};

	return (
		<Dialog
			open={open}
			onOpenChange={() => setOpen(!open)}
		>
			<DialogTrigger asChild>
				<Button
					variant="link"
					className="justify-start md:justify-center"
				>
					<Plus className="-ml-4 mr-2 rounded-full bg-secondary p-1" />
					<span className="text-xs">Upload files</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="w-3/4 rounded-md sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upload files</DialogTitle>
					<DialogDescription>
						Upload multiple PDF files to chat with
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => mutate(e)}
					ref={ref}
					action={`${process.env.NEXT_PUBLIC_BASE_URL}/file`}
					method="post"
					encType="multipart/form-data"
				>
					{/* <form onSubmit={handleSubmit} action={`${process.env.NEXT_PUBLIC_BASE_URL}/file`}> */}
					<div className="gap-4">
						<label
							htmlFor="files"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Files
						</label>
						<Input
							type="file"
							id="files"
							name="files"
							multiple
							accept="application/pdf"
							required
						/>
						<input
							type="text"
							name="owner"
							value={user?._id}
							hidden
							readOnly
						/>
					</div>

					<DialogFooter>
						<Button
							type="submit"
							size="sm"
							className="mt-5"
						>
							Upload
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
			<MultiStepLoaderDemo
				loading={loading}
				duration={duration}
			/>
		</Dialog>
	);
}

export default memo(FileDialog);
