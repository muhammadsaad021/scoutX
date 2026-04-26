import { SearchResult, ComparedPlayer } from "../types/player";

/**
 * Searches for players by a query string.
 * 
 * @param {string} query - The search query.
 * @returns {Promise<SearchResult[]>} A promise that resolves to an array of search results.
 */
export const searchPlayersAPI = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  const res = await fetch(`/api/players?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to search players.");
  }
  
  const data = await res.json();
  // Guard Clause: Only return top 5 results to prevent overwhelming the UI
  return data.slice(0, 5);
};

/**
 * Fetches data for comparing multiple players.
 * 
 * @param {number[]} playerIds - Array of player IDs to compare.
 * @returns {Promise<ComparedPlayer[]>} A promise that resolves to an array of compared players.
 */
export const comparePlayersAPI = async (playerIds: number[]): Promise<ComparedPlayer[]> => {
  if (!playerIds || playerIds.length === 0) return [];
  
  const res = await fetch(`/api/players/compare?ids=${playerIds.join(",")}`);
  const data = await res.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
};
