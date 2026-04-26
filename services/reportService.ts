import { ReportLog } from "../types/report";

/**
 * Fetches all report logs from the API.
 * 
 * @returns {Promise<ReportLog[]>} A promise that resolves to an array of report logs.
 */
export const fetchReportsAPI = async (): Promise<ReportLog[]> => {
  const res = await fetch("/api/reports");
  if (!res.ok) {
    throw new Error("Failed to fetch reports.");
  }
  return res.json();
};

/**
 * Generates a new player report.
 * 
 * @param {number} playerID - The ID of the player to generate the report for.
 * @param {string} format - The format of the report (e.g., "PDF").
 * @returns {Promise<any>} A promise that resolves to the generated report data.
 */
export const generateReportAPI = async (playerID: number, format: string = "PDF"): Promise<any> => {
  const res = await fetch("/api/reports/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerID, format }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate report.");
  }
  
  return data;
};
