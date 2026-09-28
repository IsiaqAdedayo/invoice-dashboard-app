import { api } from "@/lib/api";

export const getAdminOverview = async () => {
  return await api.get("/analytics/overview");
};

export const getRevenueChart = async (months = 6) => {
  return await api.get(`/analytics/revenue-chart?months=${months}`);
};

export const getWeeklyChart = async () => {
  return await api.get("/analytics/weekly-chart");
};

export const getAnalyticsDashboard = async () => {
  return await api.get("/analytics/dashboard");
};

export const getFullAnalytics = async () => {
  return await api.get("/analytics/full");
};

export const getRecentInvoices = async () => {
  return await api.get("/invoices/recent?limit=5");
};

export const getInvoicesDashboard = async () => {
  return await api.get("/invoices/dashboard");
};

export const getAuditLogs = async () => {
  return await api.get("/audit");
};
