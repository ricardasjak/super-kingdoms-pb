import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import { useAuth } from '../context/use-auth.hook';
import type { KingdomsResponse } from '../types/pb.model';
import type {
  KingdomBuildings,
  KingdomMilitary,
  KingdomResearch,
  BotSettings,
} from '../types/game.types';

export type TypedKingdom = KingdomsResponse<
  BotSettings,
  KingdomBuildings,
  number[],
  KingdomMilitary,
  KingdomResearch,
  string[]
>;

export interface CreateKingdomPayload {
  kdName: string;
  rulerName: string;
  planetType: string;
  raceType: string;
  botNames?: string[];
}

export interface SelfTickResponse {
  success: boolean;
  ticksAdvanced: number;
  newbiemode: number;
  kingdom: TypedKingdom;
}

export interface RestartNewbieModeResponse {
  success: boolean;
  kingdom: TypedKingdom;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const errorData = (err as { data?: { error?: string } }).data;
    if (errorData?.error) {
      return errorData.error;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function useKingdom() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const kingdomKey = ['kingdom', user?.id] as const;

  const kingdomQuery = useQuery({
    queryKey: kingdomKey,
    queryFn: async (): Promise<TypedKingdom | null> => {
      const result = await pb.collection('kingdoms').getList<TypedKingdom>(1, 1, {
        filter: `userId = "${user?.id}"`,
      });
      return result.items[0] ?? null;
    },
    enabled: isAuthenticated && !!user,
  });

  const kingdom = isAuthenticated && user ? (kingdomQuery.data ?? null) : null;

  const invalidateKingdom = () =>
    queryClient.invalidateQueries({ queryKey: ['kingdom'] });

  useEffect(() => {
    const onTick = () => {
      invalidateKingdom();
    };
    window.addEventListener("tick-advanced", onTick);
    return () => {
      window.removeEventListener("tick-advanced", onTick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  const refetch = () => invalidateKingdom();

  const createKingdom = async (payload: CreateKingdomPayload): Promise<TypedKingdom> => {
    setIsCreating(true);
    setActionError(null);
    try {
      const response = await pb.send<TypedKingdom>('/api/kingdoms/create', {
        method: 'POST',
        body: payload,
      });

      queryClient.setQueryData(kingdomKey, response);
      return response;
    } catch (err: unknown) {
      const message = errorMessage(err, 'Failed to create kingdom');
      setActionError(message);
      throw new Error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const updateRulerName = async (rulerName: string) => {
    await pb.send('/api/kingdoms/update-ruler-name', {
      method: 'POST',
      body: { rulerName },
    });
    await invalidateKingdom();
  };

  const updateBotProfile = async (botSettings: BotSettings | null) => {
    const res = await pb.send<{ success: boolean; kingdom?: TypedKingdom }>('/api/kingdoms/update-bot-profile', {
      method: 'POST',
      body: { botSettings },
    });
    if (res?.kingdom) {
      queryClient.setQueryData(kingdomKey, res.kingdom);
    }
    await invalidateKingdom();
  };

  const buildBuildings = async (buildings: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/build-buildings', {
      method: 'POST',
      body: { buildings },
    });
    await invalidateKingdom();
  };

  const razeBuildings = async (buildings: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/raze-buildings', {
      method: 'POST',
      body: { buildings },
    });
    await invalidateKingdom();
  };

  const saveAutoBuildSettings = async (payload: { target?: Record<string, number>; autoBuild?: boolean }) => {
    await pb.send('/api/kingdoms/save-auto-build', {
      method: 'POST',
      body: payload,
    });
    await invalidateKingdom();
  };

  const toggleAutoBuild = async (autoBuild: boolean) => {
    await pb.send('/api/kingdoms/toggle-auto-build', {
      method: 'POST',
      body: { autoBuild },
    });
    await invalidateKingdom();
  };

  const exploreLand = async (amount: number) => {
    const res = await pb.send<{ success: boolean; explored: number; cost: number; kingdom: TypedKingdom }>('/api/kingdoms/explore', {
      method: 'POST',
      body: { amount },
    });
    await invalidateKingdom();
    return res;
  };

  const toggleAutoExplore = async (autoExplore: number) => {
    const res = await pb.send<{ success: boolean; autoExplore: number }>('/api/kingdoms/toggle-auto-explore', {
      method: 'POST',
      body: { autoExplore },
    });
    await invalidateKingdom();
    return res;
  };

  const trainMilitary = async (units: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/train-military', {
      method: 'POST',
      body: { units },
    });
    await invalidateKingdom();
  };

  const disbandMilitary = async (units: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/disband-military', {
      method: 'POST',
      body: { units },
    });
    await invalidateKingdom();
  };

  const saveMilitaryTargets = async (target: Record<string, number>) => {
    await pb.send('/api/kingdoms/save-military-targets', {
      method: 'POST',
      body: { target },
    });
    await invalidateKingdom();
  };

  const buyScientists = async (count: number) => {
    await pb.send('/api/kingdoms/buy-scientists', {
      method: 'POST',
      body: { count },
    });
    await invalidateKingdom();
  };

  const saveResearchAutoAssign = async (priority: string[]) => {
    await pb.send('/api/kingdoms/save-research-auto-assign', {
      method: 'POST',
      body: { priority },
    });
    await invalidateKingdom();
  };

  const selfTickMutation = useMutation({
    mutationFn: () =>
      pb.send<SelfTickResponse>('/api/kingdoms/self-tick', {
        method: 'POST',
      }),
    onSuccess: (res) => {
      if (res.kingdom) {
        queryClient.setQueryData(kingdomKey, res.kingdom);
      }
    },
  });

  const selfTick = () => selfTickMutation.mutateAsync();

  const restartNewbieModeMutation = useMutation({
    mutationFn: () =>
      pb.send<RestartNewbieModeResponse>('/api/kingdoms/restart-newbie-mode', {
        method: 'POST',
      }),
    onSuccess: (res) => {
      if (res.kingdom) {
        queryClient.setQueryData(kingdomKey, res.kingdom);
      }
    },
  });

  const restartNewbieMode = () => restartNewbieModeMutation.mutateAsync();

  const resetKingdom = async () => {
    await pb.send('/api/kingdoms/reset', {
      method: 'POST',
    });
    await invalidateKingdom();
  };

  const deleteKingdom = async () => {
    await pb.send('/api/kingdoms/delete', {
      method: 'POST',
    });
    queryClient.setQueryData(kingdomKey, null);
  };

  const queryError =
    kingdomQuery.error instanceof Error
      ? kingdomQuery.error.message
      : kingdomQuery.error
        ? 'Failed to fetch kingdom'
        : null;

  return {
    kingdom,
    hasKingdom: !!kingdom,
    isLoading: kingdomQuery.isLoading,
    isCreating,
    error: actionError ?? queryError,
    refetch,
    createKingdom,
    updateRulerName,
    updateBotProfile,
    buildBuildings,
    razeBuildings,
    saveAutoBuildSettings,
    toggleAutoBuild,
    exploreLand,
    toggleAutoExplore,
    trainMilitary,
    disbandMilitary,
    saveMilitaryTargets,
    buyScientists,
    saveResearchAutoAssign,
    selfTick,
    restartNewbieMode,
    resetKingdom,
    deleteKingdom,
  };
}
