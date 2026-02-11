import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Storefront } from '../backend';
import { toast } from 'sonner';

export function useSaveStorefront() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storefront: Storefront) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.saveOrUpdateStorefront(storefront);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerStorefront'] });
    },
    onError: (error: any) => {
      console.error('Error saving storefront:', error);
      const message = error?.message || 'Failed to save storefront data';
      toast.error(message);
    },
  });
}

export function useDeleteStorefront() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.deleteStorefront();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerStorefront'] });
      toast.success('Storefront deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting storefront:', error);
      const message = error?.message || 'Failed to delete storefront';
      toast.error(message);
    },
  });
}
