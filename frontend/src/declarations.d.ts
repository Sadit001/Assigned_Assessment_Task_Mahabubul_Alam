// Type declarations for frontend dependencies
declare module '@tanstack/react-query' {
  export function useQuery<T = any>(options: any): {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch: () => Promise<any>;
  };
  export function useMutation<TData = any, TVariables = any, TContext = any>(options: any): {
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    isPending: boolean;
  };
  export function useQueryClient(): {
    cancelQueries: (options?: any) => Promise<void>;
    getQueryData: <T = any>(queryKey: any) => T | undefined;
    setQueryData: <T = any>(queryKey: any, updater: any) => void;
    invalidateQueries: (options?: any) => Promise<void>;
  };
  export class QueryClient {
    constructor(options?: any);
  }
  export const QueryClientProvider: any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'react-hook-form' {
  export function useForm<T = any>(options?: any): {
    register: (name: any, options?: any) => any;
    handleSubmit: (onValid: (data: T) => any) => (e?: any) => Promise<any>;
    control: any;
    reset: (values?: Partial<T>) => void;
    setError: (name: any, error: any) => void;
    formState: { errors: Record<string, any>; isSubmitting?: boolean };
  };
  export const Controller: any;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: any): any;
}

declare module 'canvas-confetti';
