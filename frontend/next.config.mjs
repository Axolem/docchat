import withPWAInit from "@ducanh2912/next-pwa";
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
const withPWA =
	process.env.RAILWAY_ENVIRONMENT_NAME === "production"
		? withPWAInit({
				dest: "public",
		  })
		: null;

const nextConfigPWA =
	withPWA !== null
		? withPWA({
				images: {
					remotePatterns: [
						{
							hostname: "picsum.photos",
						},
					],
				},
		  })
		: null;

export default process.env.RAILWAY_ENVIRONMENT_NAME === "production"
	? nextConfigPWA
	: nextConfig;
