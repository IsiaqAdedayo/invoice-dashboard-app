import { getInvoicesDashboard } from "@/services/admin.service";
import { useQuery } from "@tanstack/react-query";

export const useInvoicesDashboard = () => {
  return useQuery({
    queryKey: ["invoices-dashboard"],
    queryFn: getInvoicesDashboard,
  });
};
