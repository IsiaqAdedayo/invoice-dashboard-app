import { useQuery } from "@tanstack/react-query";
import { getCustomerInvoices } from "@/services/customer.service";

export const useMyInvoices = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-invoices", customerId],
    queryFn: () => getCustomerInvoices(customerId),
    enabled: !!customerId,
  });
};
