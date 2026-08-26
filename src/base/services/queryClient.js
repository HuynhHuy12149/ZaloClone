import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes: Data stays fresh, no unnecessary network requests
      gcTime: 1000 * 60 * 10,    // 10 minutes: Inactive cache retention
      retry: 2,
      refetchOnWindowFocus: false, // Prevents unwanted refetches on mobile app focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
