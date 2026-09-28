import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "@/services/customer.service";

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
