import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Recipe, UserProfile } from '../backend';

export function useGetAllRecipes() {
  const { actor, isFetching } = useActor();

  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecipe(recipeId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Recipe | null>({
    queryKey: ['recipe', recipeId?.toString()],
    queryFn: async () => {
      if (!actor || !recipeId) return null;
      try {
        return await actor.getRecipe(recipeId);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!recipeId,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
