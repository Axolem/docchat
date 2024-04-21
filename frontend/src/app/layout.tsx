import { Hedvig_Letters_Sans } from "next/font/google";
import { ThemeProvider } from "@/providers/theme";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/providers/query";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Script from "next/script";
import Footer from "@/components/footer";
import { AuthProvider } from "@/providers/auth";

const inter = Hedvig_Letters_Sans({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
	fallback: ["sans-serif"],
	preload: true,
});

export const metadata: Metadata = {
	title: {
		default: "Doc Chat",
		template: "%s | Doc Chat",
	},
	description: "A chat app to chat with your documents",
	applicationName: "Doc Chat",
	icons: [
		{
			rel: "icon",
			type: "image/png",
			href: "/favicon-16x16.png",
			sizes: "16x16",
			url: "/favicon-32x32.png",
		},
	],
	authors: [{ name: "Axole Maranjana", url: "https://axole.online" }],
	creator: "Axole Maranjana",
	category: "Chat",
	keywords: ["chat", "chatgpt", "ai", "axole"],
	manifest: "/site.manifest.json",
	metadataBase: new URL("https://docchat.axole.online/"),
	publisher: "Axole Maranjana",
	openGraph: {
		title: "Doc Chat",
		description: "A chat app to chat with your documents",
		images: [
			{
				url: "/logo.png",
				alt: "Doc Chat",
				width: 1200,
				height: 630,
			},
		],
		countryName: "South Africa",
		type: "website",
		siteName: "Doc Chat",
		url: "https://docchat.axole.online",
	},
	generator: "Next.js",
	formatDetection: {
		telephone: false,
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Doc Chat",
		// startUpImage: [],
	},
};

export const viewport: Viewport = {
	themeColor: "#FFFFFF",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="no-scrollbar"
		>
			<body className={inter.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					enableColorScheme
				>
					<QueryProvider>
						<AuthProvider>
							<Navbar />
							{children}
							<Footer />
						</AuthProvider>
					</QueryProvider>
				</ThemeProvider>
				<Toaster />
				<Script src="/js/nav.js" />
			</body>
		</html>
	);
}
