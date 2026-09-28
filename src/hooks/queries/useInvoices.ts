import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/services/invoice.service";

export const useInvoices = (p0: { search: string; status: string | undefined; page: number; limit: number; }) => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });
};
