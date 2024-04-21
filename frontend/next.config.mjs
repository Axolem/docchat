import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
});

// /** @type {import('next').NextConfig} */
// const nextConfig = {
// 	images: {
// 		remotePatterns: [
// 			{
// 				hostname: "picsum.photos",
// 			},
// 		],
// 	},
// };

// export default nextConfig;

export default withPWA({
	images: {
		remotePatterns: [
			{
				hostname: "picsum.photos",
			},
		],
	},
});
