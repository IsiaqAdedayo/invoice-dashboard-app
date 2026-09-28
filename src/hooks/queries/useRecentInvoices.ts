import { useQuery } from "@tanstack/react-query";
import { getRecentInvoices } from "@/services/admin.service";

export const useRecentInvoices = () => {
  return useQuery({
    queryKey: ["recent-invoices"],
    queryFn: getRecentInvoices,
  });
};
