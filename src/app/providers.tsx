"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";
import { ConfigProvider } from "antd";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        containerStyle={{
          position: "fixed",
          zIndex: 9999,
          top: 16,
          left: 16,
          right: 16,
          bottom: 16,
          pointerEvents: "none",
        }}
        toastOptions={{
          className: "",
          duration: 3000,
        }}
      />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1677FF",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
