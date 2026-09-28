import { getCustomerById } from "@/services/customer.service";
import { useQuery } from "@tanstack/react-query";

export const useCustomerById = (id: string | null) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id!),
    enabled: !!id,
  });
};
