'use client';

import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function ReactQueryClientProvider({
  children,
}: PropsWithChildren) {
  const client = new QueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
