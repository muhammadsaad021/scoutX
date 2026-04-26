import { useState, useEffect, useCallback } from "react";
import { ReportLog } from "../types/report";
import { fetchReportsAPI } from "../services/reportService";

/**
 * Custom hook to manage report history state.
 * 
 * @returns {{ reports: ReportLog[], loading: boolean, refreshReports: () => Promise<void> }}
 */
export const useReports = () => {
  const [reports, setReports] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReportsAPI();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  return { reports, loading, refreshReports };
};
