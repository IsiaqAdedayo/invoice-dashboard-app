import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/services/admin.service";

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });
};
