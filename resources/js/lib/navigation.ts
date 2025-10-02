import { router } from '@inertiajs/react';
import { useCallback } from 'react';

interface NavigationOptions {
  preserveState?: boolean;
  replace?: boolean;
  preserveScroll?: boolean;
}

/**
 * Hook untuk menangani navigation yang konsisten
 */
export function useNavigation() {

  const navigate = useCallback((
    routeName: string, 
    params?: Record<string, any>, 
    options: NavigationOptions = {}
  ) => {
    const { preserveState = true, replace = true, preserveScroll = false } = options;
    
    router.get(route(routeName, params), {}, { 
      preserveState, 
      replace,
      preserveScroll 
    });
  }, []);

  const navigateTo = useCallback((
    routeName: string, 
    params?: Record<string, any>
  ) => {
    router.get(route(routeName, params));
  }, []);

  const navigateBack = useCallback(() => {
    window.history.back();
  }, []);

  const navigateWithQuery = useCallback((
    routeName: string,
    query: Record<string, any>,
    options: NavigationOptions = {}
  ) => {
    const { preserveState = true, replace = true } = options;
    
    router.get(route(routeName), query, { 
      preserveState, 
      replace 
    });
  }, []);

  const navigateToCreate = useCallback((routeName: string) => {
    router.get(route(routeName + '.create'));
  }, []);

  const navigateToEdit = useCallback((routeName: string, id: number | string) => {
    router.get(route(routeName + '.edit', id));
  }, []);

  const navigateToShow = useCallback((routeName: string, id: number | string) => {
    router.get(route(routeName + '.show', id));
  }, []);

  const navigateToIndex = useCallback((routeName: string, query?: Record<string, any>) => {
    if (query) {
      navigateWithQuery(routeName + '.index', query);
    } else {
      router.get(route(routeName + '.index'));
    }
  }, [navigateWithQuery]);

  const deleteItem = useCallback((
    routeName: string, 
    id: number | string,
    options?: { onSuccess?: () => void; onError?: (error: any) => void }
  ) => {
    router.delete(route(routeName + '.destroy', id), {
      onSuccess: options?.onSuccess,
      onError: options?.onError
    });
  }, []);

  const postData = useCallback((
    routeName: string,
    data: Record<string, any>,
    options?: { 
      onSuccess?: () => void; 
      onError?: (error: any) => void;
      preserveState?: boolean;
    }
  ) => {
    router.post(route(routeName), data, {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      preserveState: options?.preserveState
    });
  }, []);

  const putData = useCallback((
    routeName: string,
    id: number | string,
    data: Record<string, any>,
    options?: { 
      onSuccess?: () => void; 
      onError?: (error: any) => void;
      preserveState?: boolean;
    }
  ) => {
    router.put(route(routeName + '.update', id), data, {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      preserveState: options?.preserveState
    });
  }, []);

  return {
    navigate,
    navigateTo,
    navigateBack,
    navigateWithQuery,
    navigateToCreate,
    navigateToEdit,
    navigateToShow,
    navigateToIndex,
    deleteItem,
    postData,
    putData,
    router
  };
}
