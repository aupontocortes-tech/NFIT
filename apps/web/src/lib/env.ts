export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

const mockFlag = (process.env.NEXT_PUBLIC_USE_MOCK ?? "true").toLowerCase();

export const USE_MOCK = mockFlag !== "false" && mockFlag !== "0";
