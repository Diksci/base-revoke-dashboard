"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react"; // Tambahkan ini

// 1. Setup Config Wagmi
const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  // 2. Setup Query Client di dalam State agar stabil (Anti-Error)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}