import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StacksWalletProvider } from "./contexts/StacksWalletContext";

const client = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <StacksWalletProvider>
        <App />
      </StacksWalletProvider>
    </QueryClientProvider>
  </StrictMode>
)
