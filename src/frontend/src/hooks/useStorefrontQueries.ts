import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Storefront, Product, ExternalSupportLink } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetCallerStorefront() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Storefront | null>({
    queryKey: ['callerStorefront'],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        const callerPrincipal = identity.getPrincipal();
        return await actor.getUserStorefront(callerPrincipal);
      } catch (error) {
        console.error('Error fetching caller storefront:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserStorefront(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Storefront | null>({
    queryKey: ['userStorefront', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        return await actor.getUserStorefront(user);
      } catch (error) {
        console.error('Error fetching user storefront:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetUserProducts(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['userProducts', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserProducts(user);
      } catch (error) {
        console.error('Error fetching user products:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetUserSupportLinks(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalSupportLink[]>({
    queryKey: ['userSupportLinks', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserSupportLinks(user);
      } catch (error) {
        console.error('Error fetching user support links:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
