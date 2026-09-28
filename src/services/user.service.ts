import { api } from "@/lib/api";

export const getUsers = async (params?: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, String(value));
    });
  }
  const queryString = searchParams.toString();
  return await api.get(`/users${queryString ? `?${queryString}` : ""}`);
};

export const healthCheck = async () => {
  return await api.get("/");
};
