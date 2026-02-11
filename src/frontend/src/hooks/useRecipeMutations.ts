import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Ingredient } from '../backend';
import { toast } from 'sonner';

export function useCreateRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      ingredients,
      steps,
    }: {
      title: string;
      description: string;
      ingredients: Ingredient[];
      steps: string[];
    }) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.createRecipe(title, description, ingredients, steps);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe created successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create recipe';
      toast.error(message);
    },
  });
}

export function useUpdateRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      title,
      description,
      ingredients,
      steps,
    }: {
      recipeId: bigint;
      title: string;
      description: string;
      ingredients: Ingredient[];
      steps: string[];
    }) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.updateRecipe(recipeId, title, description, ingredients, steps);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', variables.recipeId.toString()] });
      toast.success('Recipe updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update recipe';
      toast.error(message);
    },
  });
}

export function useDeleteRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: bigint) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.deleteRecipe(recipeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete recipe';
      toast.error(message);
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to save profile';
      toast.error(message);
    },
  });
}
