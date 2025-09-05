'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

// Create a stable QueryClient instance
let queryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return queryClient
}

const Provider = ({
  children,
}: Readonly<{
  children: ReactNode
}>) => {
  const client = getQueryClient()
  
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  )
}

export default Provider
