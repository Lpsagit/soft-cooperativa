import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { CustomModal } from "./user/components/CustomModal";
import { type PropsWithChildren } from "react";
import { CustomFullScreenLoading } from "./components/custom/CustomFullScreenLoading";
import { useAuthStore } from "./auth/store/auth.store";
import { queryClient } from "@/lib/queryClient";

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const { checkAuthStatus } = useAuthStore();
  const { isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: checkAuthStatus,
    retry: false,
  });
  if (isLoading) return <CustomFullScreenLoading />;
  return children;
};

export const CooperativaUserApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {/* Custom provider */}
      <CheckAuthProvider>
        <RouterProvider router={appRouter} />
        <CustomModal />
      </CheckAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
