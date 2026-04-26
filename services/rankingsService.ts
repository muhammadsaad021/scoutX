import { RankedPlayer } from "../types/player";

/**
 * Fetches rankings from the API, optionally filtered by position.
 * 
 * @param {string} position - The position to filter by (optional).
 * @returns {Promise<{ ranked: RankedPlayer[], total: number, message?: string }>} The rankings data.
 */
export const fetchRankingsAPI = async (position?: string): Promise<{ ranked: RankedPlayer[], total: number, message?: string }> => {
  const params = new URLSearchParams();
  if (position) params.set("position", position);

  const res = await fetch(`/api/rankings?${params}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch rankings.");
  }

  return data;
};

/**
 * Triggers a download of the rankings as a CSV file.
 * 
 * @param {string} position - The position filter (optional).
 * @returns {Promise<void>}
 */
export const exportRankingsAPI = async (position?: string): Promise<void> => {
  const params = new URLSearchParams();
  if (position) params.set("position", position);
  
  const res = await fetch(`/api/rankings/export?${params}`);
  if (!res.ok) {
    throw new Error("Failed to export rankings.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const contentDisposition = res.headers.get("Content-Disposition");
  let filename = "rankings.csv";
  if (contentDisposition) {
    const filenameMatch = contentDisposition.split('filename="')[1];
    if (filenameMatch) {
      filename = filenameMatch.replace('"', '');
    }
  }
  
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
