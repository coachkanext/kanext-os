/**
 * React Query Provider — KaNeXT OS
 *
 * Wraps the app with QueryClientProvider. Sensible defaults:
 * - 5 min stale time (avoid refetching on every mount)
 * - 2 retries (Supabase can have transient failures)
 * - No refetch-on-focus (mobile apps resume frequently)
 */

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export { queryClient };

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
