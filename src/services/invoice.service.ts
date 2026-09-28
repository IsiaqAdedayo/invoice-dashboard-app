import { api } from "@/lib/api";

export const getInvoices = async (params?: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }
  const queryString = searchParams.toString();
  return await api.get(`/invoices${queryString ? `?${queryString}` : ""}`);
};

export const createInvoice = async (data: any) => {
  return await api.post("/invoices", data);
};

export const updateInvoiceStatus = async (id: string, status: string) => {
  return await api.patch(`/invoices/${id}/status`, { status });
};

export const payInvoice = async (id: string, amount: number) => {
  return await api.post(`/invoices/${id}/pay`, { amount });
};

export const refundInvoice = async (id: string) => {
  return await api.post(`/invoices/${id}/refund`, {});
};

import { getSession } from "next-auth/react";

export const getInvoicePdfUrl = async (id: string) => {
  return `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf`;
};

export const downloadInvoicePdf = async (id: string) => {
  const session = await getSession();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${(session as any)?.accessToken}`,
      },
    },
  );

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice_${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
