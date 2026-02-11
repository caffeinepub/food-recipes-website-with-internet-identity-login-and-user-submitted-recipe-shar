import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Recipe, UserProfile } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

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

export function useGetRecentRecipes(excludeOwn: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Recipe[]>({
    queryKey: ['recentRecipes', excludeOwn],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentRecipes(excludeOwn);
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

export function useHasUserLikedRecipe(recipeId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['hasLiked', recipeId?.toString()],
    queryFn: async () => {
      if (!actor || !recipeId) return false;
      try {
        return await actor.hasUserLikedRecipe(recipeId);
      } catch (error) {
        console.error('Error checking like status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!recipeId && !!identity,
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

export function useGetUserProfile(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        return await actor.getUserProfile(user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
