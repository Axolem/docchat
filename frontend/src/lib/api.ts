import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw ("NEXT_PUBLIC_BASE_URL is required")
}

export const getAnswer = async (query: string) => {
    const form_data = new FormData();
    form_data.append("message", query);

    // biome-ignore lint/style/noNonNullAssertion: 
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL!, {
        method: "POST",
        body: form_data,
        redirect: "follow"
    })

    if (!res.ok) {
        throw (await res.text())
    }

    return await res.text()
}

export const useGetFiles = () => {
    return useQuery({
        queryKey: ["files"],
        queryFn: async () => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL!)

            if (!res.ok) {
                throw (await res.text())
            }

            return await res.json() as {
                _creationTime: number;
                _id: string;
                name: string;
                owner: string;
            }[]
        }
    })
}

export const useDeleteFile = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id }: { id: string; name: string }) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/file/${id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                throw (await res.text())
            }

            queryClient.invalidateQueries({ queryKey: ["files"] })
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message, { dismissible: true, duration: 2000, })
        },
        onSuccess(_, variables) {
            toast.success(`File ${variables.name} deleted successfully`, { dismissible: true, duration: 2000, })
        },
    })
}
