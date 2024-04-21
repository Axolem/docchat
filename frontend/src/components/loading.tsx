import { MultiStepLoader as Loader } from "@/components/multi-step-loader";

const loadingStates = [
	{
		text: "Uploading",
	},
	{
		text: "Crashing the files",
	},
	{
		text: "Getting the context",
	},
	{
		text: "Saving to the chat",
	},
	{
		text: "Done",
	},
];

export function MultiStepLoaderDemo({ loading = false, duration = 2000 }) {
	return (
		<Loader
			loadingStates={loadingStates}
			loading={loading}
			duration={duration}
		/>
	);
}
