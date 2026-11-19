import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { type PropsWithChildren } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "./auth/store/auth.store";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { CustomFullScreenLoading } from "./components/custom/CustomFullScreenLoading";
import { queryClient } from "./lib/queryClient";
import { ModalContainer } from "./admin/components/modal/ModalContainer";

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

export const CooperativaApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Custom provider */}
      <CheckAuthProvider>
        <RouterProvider router={appRouter} />
      </CheckAuthProvider>
      <ModalContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
