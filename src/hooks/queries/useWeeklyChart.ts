import { useQuery } from "@tanstack/react-query";
import { getWeeklyChart } from "@/services/admin.service";

export const useWeeklyChart = () => {
  return useQuery({
    queryKey: ["weekly-chart"],
    queryFn: getWeeklyChart,
  });
};
