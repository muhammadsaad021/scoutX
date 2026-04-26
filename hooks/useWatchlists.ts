import { useState, useEffect, useCallback } from "react";
import { Watchlist } from "../types/watchlist";
import { fetchWatchlistsAPI, createWatchlistAPI, deleteWatchlistAPI } from "../services/watchlistService";

/**
 * Custom hook to manage watchlists state and operations.
 * 
 * @returns {{
 *   watchlists: Watchlist[],
 *   loading: boolean,
 *   refreshWatchlists: () => Promise<void>,
 *   createWatchlist: (name: string) => Promise<void>,
 *   deleteWatchlist: (id: number) => Promise<void>
 * }}
 */
export const useWatchlists = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshWatchlists = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    try {
      const data = await fetchWatchlistsAPI();
      if (isMounted) setWatchlists(data);
    } catch (err) {
      console.error("Failed to refresh watchlists:", err);
      if (isMounted) setWatchlists([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWatchlists();
  }, [refreshWatchlists]);

  const createWatchlist = async (name: string) => {
    if (!name.trim()) throw new Error("Watchlist name cannot be empty.");
    await createWatchlistAPI(name);
    await refreshWatchlists();
  };

  const deleteWatchlist = async (id: number) => {
    await deleteWatchlistAPI(id);
    await refreshWatchlists();
  };

  return { watchlists, loading, refreshWatchlists, createWatchlist, deleteWatchlist };
};
