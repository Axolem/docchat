/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: "picsum.photos",
			},
		],
	},
};

export default nextConfig;

// import withPWAInit from "@ducanh2912/next-pwa";

// const withPWA = withPWAInit({
// 	dest: "public",
// });
// export default withPWA({
// 	images: {
// 		remotePatterns: [
// 			{
// 				hostname: "picsum.photos",
// 			},
// 		],
// 	},
// });
