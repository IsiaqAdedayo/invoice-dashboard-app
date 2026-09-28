import { api } from "@/lib/api";

export const getCustomers = async () => {
  return await api.get("/customers");
};

export const getCustomerInvoices = async (customerId: string) => {
  return await api.get(`/customers/${customerId}/invoices`);
};

export const createCustomer = async (data: any) => {
  return await api.post("/customers", data);
};

export const getCustomerById = async (id: string) => {
  return await api.get(`/customers/${id}`);
};
