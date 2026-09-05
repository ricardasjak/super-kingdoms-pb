import { useState, useEffect, useCallback } from 'react';
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

export function useKingdom() {
  const { user, isAuthenticated } = useAuth();
  const [kingdom, setKingdom] = useState<TypedKingdom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKingdom = useCallback(async (showLoading = true) => {
    if (!isAuthenticated || !user) {
      setKingdom(null);
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await pb.collection('kingdoms').getList<TypedKingdom>(1, 1, {
        filter: `userId = "${user.id}"`,
      });

      if (result.items.length > 0) {
        setKingdom(result.items[0]);
      } else {
        setKingdom(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch kingdom';
      console.error('Error fetching kingdom:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated || !user) {
      Promise.resolve().then(() => {
        if (active) {
          setKingdom(null);
          setIsLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }

    pb.collection('kingdoms')
      .getList<TypedKingdom>(1, 1, {
        filter: `userId = "${user.id}"`,
      })
      .then((result) => {
        if (active) {
          setKingdom(result.items[0] || null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const message = err instanceof Error ? err.message : 'Failed to fetch kingdom';
          console.error('Error fetching kingdom:', message);
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  const createKingdom = async (payload: CreateKingdomPayload): Promise<TypedKingdom> => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await pb.send<TypedKingdom>('/api/kingdoms/create', {
        method: 'POST',
        body: payload,
      });

      setKingdom(response);
      return response;
    } catch (err: unknown) {
      let message = 'Failed to create kingdom';
      if (err && typeof err === 'object' && 'data' in err) {
        const errorData = (err as { data?: { error?: string } }).data;
        if (errorData?.error) {
          message = errorData.error;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
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
    await fetchKingdom(false);
  };

  const updateBotProfile = async (botSettings: BotSettings | null) => {
    await pb.send('/api/kingdoms/update-bot-profile', {
      method: 'POST',
      body: { botSettings },
    });
    await fetchKingdom(false);
  };

  const buildBuildings = async (buildings: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/build-buildings', {
      method: 'POST',
      body: { buildings },
    });
    await fetchKingdom(false);
  };

  const razeBuildings = async (buildings: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/raze-buildings', {
      method: 'POST',
      body: { buildings },
    });
    await fetchKingdom(false);
  };

  const saveAutoBuildSettings = async (payload: { target?: Record<string, number>; autoBuild?: boolean }) => {
    await pb.send('/api/kingdoms/save-auto-build', {
      method: 'POST',
      body: payload,
    });
    await fetchKingdom(false);
  };

  const toggleAutoBuild = async (autoBuild: boolean) => {
    await pb.send('/api/kingdoms/toggle-auto-build', {
      method: 'POST',
      body: { autoBuild },
    });
    await fetchKingdom(false);
  };

  const trainMilitary = async (units: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/train-military', {
      method: 'POST',
      body: { units },
    });
    await fetchKingdom(false);
  };

  const disbandMilitary = async (units: Record<string, number | string>) => {
    await pb.send('/api/kingdoms/disband-military', {
      method: 'POST',
      body: { units },
    });
    await fetchKingdom(false);
  };

  const saveMilitaryTargets = async (target: Record<string, number>) => {
    await pb.send('/api/kingdoms/save-military-targets', {
      method: 'POST',
      body: { target },
    });
    await fetchKingdom(false);
  };

  const buyScientists = async (count: number) => {
    await pb.send('/api/kingdoms/buy-scientists', {
      method: 'POST',
      body: { count },
    });
    await fetchKingdom(false);
  };

  const saveResearchAutoAssign = async (priority: string[]) => {
    await pb.send('/api/kingdoms/save-research-auto-assign', {
      method: 'POST',
      body: { priority },
    });
    await fetchKingdom(false);
  };

  const resetKingdom = async () => {
    await pb.send('/api/kingdoms/reset', {
      method: 'POST',
    });
    await fetchKingdom(false);
  };

  const deleteKingdom = async () => {
    await pb.send('/api/kingdoms/delete', {
      method: 'POST',
    });
    setKingdom(null);
  };

  return {
    kingdom,
    hasKingdom: !!kingdom,
    isLoading,
    isCreating,
    error,
    refetch: fetchKingdom,
    createKingdom,
    updateRulerName,
    updateBotProfile,
    buildBuildings,
    razeBuildings,
    saveAutoBuildSettings,
    toggleAutoBuild,
    trainMilitary,
    disbandMilitary,
    saveMilitaryTargets,
    buyScientists,
    saveResearchAutoAssign,
    resetKingdom,
    deleteKingdom,
  };
}
