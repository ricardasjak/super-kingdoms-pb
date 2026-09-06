import { useState, useEffect, useCallback } from "react";
import { pb } from "../lib/pocketbase";

export interface GameStatusData {
  currentTick: number;
  endTick: number;
  roundNumber: number;
  kingdomCount: number;
}

export function useGameStatus() {
  const [status, setStatus] = useState<GameStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await pb.send<GameStatusData>("/api/game/status", {
        method: "GET",
      });
      setStatus(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch game status";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 10 seconds for game tick updates
    const timer = setInterval(fetchStatus, 10000);
    const onTick = () => fetchStatus();
    window.addEventListener("tick-advanced", onTick);
    return () => {
      clearInterval(timer);
      window.removeEventListener("tick-advanced", onTick);
    };
  }, [fetchStatus]);

  const restartGame = async () => {
    await pb.send("/api/game/restart", { method: "POST" });
    await fetchStatus();
  };

  const populateKingdoms = async () => {
    await pb.send("/api/game/populate", { method: "POST" });
    await fetchStatus();
  };

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    restartGame,
    populateKingdoms,
  };
}
