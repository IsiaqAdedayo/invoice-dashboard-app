"use client";

import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#6366F1",
                  borderRadius: 10,
                  fontFamily: "Sora, sans-serif",
                },
              }}
            >
              {children}
            </ConfigProvider>
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
