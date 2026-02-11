import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Ingredient } from '../backend';
import { ExternalBlob } from '../backend';
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
      photo,
    }: {
      title: string;
      description: string;
      ingredients: Ingredient[];
      steps: string[];
      photo?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.createRecipe(title, description, ingredients, steps, photo || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recentRecipes'] });
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
      photo,
    }: {
      recipeId: bigint;
      title: string;
      description: string;
      ingredients: Ingredient[];
      steps: string[];
      photo?: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.updateRecipe(recipeId, title, description, ingredients, steps, photo || null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recentRecipes'] });
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
      queryClient.invalidateQueries({ queryKey: ['recentRecipes'] });
      toast.success('Recipe deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete recipe';
      toast.error(message);
    },
  });
}

export function useLikeRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: bigint) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.likeRecipe(recipeId);
    },
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recentRecipes'] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked', recipeId.toString()] });
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to like recipe';
      toast.error(message);
    },
  });
}

export function useUnlikeRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: bigint) => {
      if (!actor) throw new Error('Not authenticated');
      return actor.unlikeRecipe(recipeId);
    },
    onSuccess: (_, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recentRecipes'] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked', recipeId.toString()] });
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to unlike recipe';
      toast.error(message);
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipeId, content }: { recipeId: bigint; content: string }) => {
      if (!actor) throw new Error('Not authenticated');
      const timestamp = BigInt(Date.now() * 1000000);
      return actor.addComment(recipeId, content, timestamp);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', variables.recipeId.toString()] });
      toast.success('Comment added successfully!');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add comment';
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
