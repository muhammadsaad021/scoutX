import { useState, useEffect } from "react";
import { ComparedPlayer } from "../types/player";
import { comparePlayersAPI } from "../services/playerService";

/**
 * Custom hook to manage the state of compared players.
 * 
 * @param {number[]} selectedIds - Array of selected player IDs.
 * @returns {{ compared: ComparedPlayer[], loading: boolean }}
 */
export const useComparePlayers = (selectedIds: number[]) => {
  const [compared, setCompared] = useState<ComparedPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Guard Clause: Early return if no players selected
    if (selectedIds.length === 0) {
      setCompared([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    comparePlayersAPI(selectedIds)
      .then((data) => {
        if (isMounted) setCompared(data);
      })
      .catch((err) => {
        console.error("Comparison fetch failed:", err);
        if (isMounted) setCompared([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIds]);

  return { compared, loading };
};
