"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

const QueryProvider = ({ children }: {
    children: React.ReactNode

}) =>
(<QueryClientProvider client={queryClient}>
    {children}
</QueryClientProvider>
)

export { QueryProvider }