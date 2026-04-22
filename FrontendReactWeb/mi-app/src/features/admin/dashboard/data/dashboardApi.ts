import type { DashboardData, Period } from "../types/dashboard.types";
import { mockDashboardData } from "./dashboardData";

export async function fetchDashboardData(period: Period): Promise<DashboardData> {
  void period;
  return mockDashboardData;
}
