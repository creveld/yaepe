import { QueryClient } from 'react-query';

/**
 * Single shared React Query client for the app.
 * Extracted so screens, tests and future features use the same cache.
 */
export const queryClient = new QueryClient();
