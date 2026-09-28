/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "next-auth/react";

const request = async (
  url: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
) => {
  const session = await getSession();

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`,
    {
      ...options,
      body,
      headers: {
        "Content-Type": "application/json",
        ...((session as any)?.accessToken && {
          Authorization: `Bearer ${(session as any).accessToken}`,
        }),
        ...options.headers,
      },
    }
  );

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
};

export const api = {
  get: (url: string, options?: Omit<RequestInit, "body">) => request(url, { ...options, method: "GET" }),
  post: (url: string, body?: any, options?: Omit<RequestInit, "body">) => request(url, { ...options, method: "POST", body }),
  put: (url: string, body?: any, options?: Omit<RequestInit, "body">) => request(url, { ...options, method: "PUT", body }),
  patch: (url: string, body?: any, options?: Omit<RequestInit, "body">) => request(url, { ...options, method: "PATCH", body }),
  delete: (url: string, options?: Omit<RequestInit, "body">) => request(url, { ...options, method: "DELETE" }),
};
