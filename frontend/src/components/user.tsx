import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "./ui/button";
import { useAuth } from "@/providers/auth";
import { memo } from "react";
import { getUsage } from "@/lib/api";

function User() {
	const { user, logout } = useAuth();

	const { data } = getUsage();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="overflow-hidden rounded-full"
				>
					<Image
						src={`https://picsum.photos/seed/${user?._id}/200/200`}
						width={36}
						height={36}
						alt="Avatar"
						className="overflow-hidden rounded-full"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
				<DropdownMenuItem>
					📊 {data?.calls ?? 0}/100 this month
				</DropdownMenuItem>
				{/* <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem> */}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
export default memo(User);
