import { useState, useEffect, useCallback } from "react";
import { RankedPlayer } from "../types/player";
import { fetchRankingsAPI } from "../services/rankingsService";

/**
 * Custom hook to manage rankings state and logic.
 * 
 * @param {string} positionFilter - Current position filter.
 * @returns {{ ranked: RankedPlayer[], total: number, loading: boolean, message: string }}
 */
export const useRankings = (positionFilter: string) => {
  const [ranked, setRanked] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const refreshRankings = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchRankingsAPI(positionFilter);
      if (isMounted) {
        setRanked(data.ranked);
        setTotal(data.total);
        if (data.message) setMessage(data.message);
      }
    } catch (err: any) {
      console.error("Rankings fetch failed:", err);
      if (isMounted) {
        setRanked([]);
        setTotal(0);
        setMessage(err.message || "Failed to load rankings.");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [positionFilter]);

  useEffect(() => {
    refreshRankings();
  }, [refreshRankings]);

  return { ranked, total, loading, message };
};
