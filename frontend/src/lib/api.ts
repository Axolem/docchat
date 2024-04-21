import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
	throw "NEXT_PUBLIC_BASE_URL is required";
}

export const getAnswer = async (query: string) => {
	const form_data = new FormData();
	form_data.append("message", query);

	// biome-ignore lint/style/noNonNullAssertion:
	const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL!, {
		method: "POST",
		body: form_data,
		headers: {
			token: localStorage.getItem("token") ?? "",
		},
	});

	if (!res.ok) {
		throw await res.text();
	}

	return await res.text();
};
export const getAnswerV2 = async (
	message: string,
	history: { text: string; user: "user" | "system" }[]
) => {
	// Make a tuple of the history array
	const historyTuple = history.map((m) => [m.text, m.user]);

	// biome-ignore lint/style/noNonNullAssertion:
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/v2`, {
		method: "POST",
		body: JSON.stringify({ message, history: historyTuple.slice(-10) }),
		headers: {
			token: localStorage.getItem("token") ?? "",
		},
	});

	if (!res.ok) {
		throw await res.text();
	}

	return await res.json();
};

export const useGetFiles = () => {
	const { logout } = useAuth();
	return useQuery({
		queryKey: ["files"],
		queryFn: async () => {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL!, {
				headers: {
					token: localStorage.getItem("token") ?? "",
				},
			});

			if (!res.ok) {
				if (res.status === 401) {
					logout();
				}
				throw await res.json();
			}

			return (await res.json()) as {
				_creationTime: number;
				_id: string;
				name: string;
				owner: string;
			}[];
		},
	});
};

export const useDeleteFile = () => {
	const queryClient = useQueryClient();
	const { logout } = useAuth();
	return useMutation({
		mutationFn: async ({ id }: { id: string; name: string }) => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BASE_URL}/file/${id}`,
				{
					method: "DELETE",
					headers: {
						token: localStorage.getItem("token") ?? "",
					},
				}
			);

			if (!res.ok) {
				if (res.status === 401) {
					logout();
				}
				throw await res.json();
			}

			queryClient.invalidateQueries({ queryKey: ["files"] });
		},
		onError: (error) => {
			// console.error(error)
			toast.error(error.message, { dismissible: true, duration: 2000 });
		},
		onSuccess(_, variables) {
			toast.success(`File ${variables.name} deleted successfully`, {
				dismissible: true,
				duration: 2000,
			});
		},
	});
};

export const verifyEmail = async (token: string) => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/verify/${token}`
	);

	if (!res.ok) {
		return false;
	}

	return true;
};
