import { Watchlist } from "../types/watchlist";

/**
 * Fetches all watchlists for the current user.
 * 
 * @returns {Promise<Watchlist[]>} A promise resolving to an array of watchlists.
 */
export const fetchWatchlistsAPI = async (): Promise<Watchlist[]> => {
  const res = await fetch("/api/watchlists");
  if (!res.ok) {
    throw new Error("Failed to fetch watchlists.");
  }
  return res.json();
};

/**
 * Creates a new watchlist.
 * 
 * @param {string} listName - The name of the new watchlist.
 * @returns {Promise<Watchlist>} A promise resolving to the created watchlist.
 */
export const createWatchlistAPI = async (listName: string): Promise<Watchlist> => {
  const res = await fetch("/api/watchlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listName }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create watchlist.");
  }

  return data;
};

/**
 * Deletes a watchlist by its ID.
 * 
 * @param {number} id - The ID of the watchlist to delete.
 * @returns {Promise<void>}
 */
export const deleteWatchlistAPI = async (id: number): Promise<void> => {
  const res = await fetch(`/api/watchlists/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete watchlist.");
  }
};
