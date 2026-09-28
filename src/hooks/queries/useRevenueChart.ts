import { useQuery } from "@tanstack/react-query";
import { getRevenueChart } from "@/services/admin.service";

export const useRevenueChart = (months = 6) => {
  return useQuery({
    queryKey: ["revenue-chart", months],
    queryFn: () => getRevenueChart(months),
  });
};
