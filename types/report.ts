/**
 * Represents a basic player entity attached to a report.
 */
export interface ReportPlayer {
  Name: string;
  Position: string;
}

/**
 * Represents a user who generated a report.
 */
export interface ReportUser {
  Name: string;
}

/**
 * Represents a generated player report log.
 */
export interface ReportLog {
  ReportID: number;
  GeneratedDate: string;
  Format: string;
  Players: ReportPlayer | null;
  Users: ReportUser | null;
}
