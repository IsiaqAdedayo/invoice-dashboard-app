import { getUsers } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const useUsers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};
