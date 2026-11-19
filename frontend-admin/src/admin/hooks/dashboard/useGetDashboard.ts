import { getDashboardData } from "@/admin/actions/dashboard.action";
import { useQuery } from "@tanstack/react-query";

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
