import { useState, useEffect, useCallback } from 'react';
import { pb } from '../lib/pocketbase';
import { useAuth } from '../context/use-auth.hook';
import type { KingdomsResponse } from '../types/pb.model';

export interface CreateKingdomPayload {
  kdName: string;
  rulerName: string;
  planetType: string;
  raceType: string;
  botNames?: string[];
}

export function useKingdom() {
  const { user, isAuthenticated } = useAuth();
  const [kingdom, setKingdom] = useState<KingdomsResponse | null>(null);
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
      const result = await pb.collection('kingdoms').getList<KingdomsResponse>(1, 1, {
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
      .getList<KingdomsResponse>(1, 1, {
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

  const createKingdom = async (payload: CreateKingdomPayload): Promise<KingdomsResponse> => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await pb.send<KingdomsResponse>('/api/kingdoms/create', {
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

  return {
    kingdom,
    hasKingdom: !!kingdom,
    isLoading,
    isCreating,
    error,
    refetch: fetchKingdom,
    createKingdom,
  };
}
