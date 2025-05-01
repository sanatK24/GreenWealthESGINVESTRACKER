
import { QueryClient } from "@tanstack/react-query";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method: string, path: string, body?: any) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  await throwIfResNotOk(res);
  return res;
}

export function getQueryFn(options: { on401?: 'returnNull' | 'throw' } = {}) {
  return async ({ queryKey: [path] }: { queryKey: string[] }) => {
    const res = await fetch(path as string);
    if (res.status === 401 && options.on401 === 'returnNull') {
      return null;
    }
    await throwIfResNotOk(res);
    return res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: false,
      suspense: false,
    },
  },
});
