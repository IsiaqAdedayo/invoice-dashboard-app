import { useQuery } from "@tanstack/react-query";
import { getFullAnalytics } from "@/services/admin.service";

export const useFullAnalytics = () => {
  return useQuery({
    queryKey: ["full-analytics"],
    queryFn: getFullAnalytics,
  });
};
