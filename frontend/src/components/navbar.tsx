"use client";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assest/img/logo.png";
import User from "./user";
import { useAuth } from "@/providers/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Navbar() {
	const { user } = useAuth();

	if (!user) return null;

	return (
		<div className="sticky top-0 z-50">
			<nav className="relative flex items-center justify-between border-b px-4 py-4 backdrop-blur-md">
				<Link
					className="text-3xl font-bold leading-none"
					href="/"
				>
					<Image
						src={logo}
						alt="logo"
						width={40}
						height={40}
					/>
				</Link>
				{/* <div className="lg:hidden">
                    <Button size="icon" variant="ghost" className="navbar-burger flex items-center p-3">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div> */}
				{/* <ul className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform lg:mx-auto lg:flex lg:w-auto lg:items-center lg:space-x-6">
                    <li><Link className="text-sm text-gray-400 hover:text-gray-500" href="#">Home</Link></li>
                    <li className="text-gray-300">
                        <EllipsisVertical className="h-4 w-4" />
                    </li>
                    <li><Link className="text-sm font-bold text-blue-600" href="#">About Us</Link></li>
                    <li className="text-gray-300">
                        <EllipsisVertical className="h-4 w-4" />
                    </li>
                    <li><Link className="text-sm text-gray-400 hover:text-gray-500" href="#">Services</Link></li>
                    <li className="text-gray-300">
                        <EllipsisVertical className="h-4 w-4" />
                    </li>
                    <li><Link className="text-sm text-gray-400 hover:text-gray-500" href="#">Pricing</Link></li>
                    <li className="text-gray-300">
                        <EllipsisVertical className="h-4 w-4" />
                    </li>
                    <li><Link className="text-sm text-gray-400 hover:text-gray-500" href="#">Contact</Link></li>
                </ul> */}
				<User />
			</nav>
			<div className="navbar-menu relative z-50 hidden">
				<div className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25" />
				<nav className="fixed bottom-0 left-0 top-0 flex w-5/6 max-w-sm flex-col overflow-y-auto border-r bg-white px-6 py-6">
					<div className="mb-8 flex items-center">
						<Link
							className="mr-auto text-3xl font-bold leading-none"
							href="#"
						>
							<Image
								src={logo}
								alt="logo"
								width={40}
								height={40}
							/>
						</Link>
						{/* <Button className="navbar-close">
                            <svg className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button> */}
					</div>
					<div>
						{/* <ul>
                            <li className="mb-1">
                                <Link className="block rounded p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600" href="#">Home</Link>
                            </li>
                            <li className="mb-1">
                                <Link className="block rounded p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600" href="#">About Us</Link>
                            </li>
                            <li className="mb-1">
                                <Link className="block rounded p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600" href="#">Services</Link>
                            </li>
                            <li className="mb-1">
                                <Link className="block rounded p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600" href="#">Pricing</Link>
                            </li>
                            <li className="mb-1">
                                <Link className="block rounded p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600" href="#">Contact</Link>
                            </li>
                        </ul> */}
					</div>
					<div className="mt-auto">
						<div className="pt-6">
							<Suspense
								fallback={
									<Skeleton className="h-12 w-12 rounded-full" />
								}
							>
								<User />
							</Suspense>
						</div>
						<p className="my-4 text-center text-xs text-gray-400">
							<span>Copyright © 2024</span>
						</p>
					</div>
				</nav>
			</div>
		</div>
	);
}
