import { getAnalyticsDashboard } from "@/services/admin.service";
import { useQuery } from "@tanstack/react-query";

export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: getAnalyticsDashboard,
  });
};
