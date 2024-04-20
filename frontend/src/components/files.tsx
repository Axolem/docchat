import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileSliders, RefreshCw, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDeleteFile, useGetFiles } from "@/lib/api";
import { formatDistance } from "date-fns";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FilesList() {
	const { data: files, error, refetch, isRefetching } = useGetFiles();

	const { mutate } = useDeleteFile();
	const handleDelete = (id: string, name: string) => {
		mutate({ id, name: name ?? id });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
				>
					<FileSliders className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<div className="flex items-center justify-between">
					<h4 className="mb-4 p-4 text-sm font-medium leading-none">
						Files in this chat
					</h4>
					<Button
						variant="outline"
						size="icon"
						className="m-4 h-8 w-8 cursor-pointer p-0 hover:text-primary/70 active:text-secondary"
						onClick={() => refetch()}
					>
						<RefreshCw
							className={` h-4 w-4 cursor-pointer hover:h-5 hover:w-5 transition-all ease-in-out duration-150 ${
								isRefetching && "animate-spin"
							} `}
						/>
					</Button>
				</div>
				<ScrollArea className="h-96 w-96 rounded-md">
					<div className="p-4 pt-0">
						{files?.map((tag) => (
							<div key={tag._id}>
								<Separator className="my-2" />
								<div className="flex items-center justify-between align-middle text-sm">
									<div>
										<p>{tag.name}</p>
										<p className="text-xs text-gray-400">
											{formatDistance(
												new Date(tag._creationTime),
												new Date(),
												{ addSuffix: true }
											)}
										</p>
									</div>
									<Button
										variant="destructive"
										className="h-8 w-8 cursor-pointer p-0 text-left hover:text-primary/70 active:text-secondary"
										onClick={() =>
											handleDelete(tag._id, tag.name)
										}
										size="icon"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
						<Separator className="my-2" />
					</div>
					{error && (
						<p className="p-4 text-sm font-medium leading-none text-red-500">
							An error occurred while fetching files
						</p>
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
