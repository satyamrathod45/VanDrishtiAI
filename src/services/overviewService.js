import { api } from "./api";

export const overviewService = {
  async getOverview() {
    return api.get("/api/overview");
  },
};