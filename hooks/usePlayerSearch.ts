import { useState, useEffect } from "react";
import { SearchResult } from "../types/player";
import { searchPlayersAPI } from "../services/playerService";

/**
 * Custom hook to handle live player search with debouncing.
 * 
 * @param {string} query - The search query input.
 * @param {number} delayMs - The debounce delay in milliseconds (default: 300).
 * @returns {{ searchResults: SearchResult[], isSearching: boolean, clearSearch: () => void }}
 */
export const usePlayerSearch = (query: string, delayMs: number = 300) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const clearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  useEffect(() => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlayersAPI(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [query, delayMs]);

  return { searchResults, isSearching, clearSearch };
};
