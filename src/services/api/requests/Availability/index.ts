import { api } from "../..";

export interface AvailabilityWeekly {
  id: string;
  weekday: string; // "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"
  startMin: number; // minutos desde a meia-noite
  endMin: number;
}

export interface AvailabilityBlock {
  id: string;
  startAt: string;
  endAt: string;
  type: "BLOQUEIO" | "FERIAS" | "FOLGA";
}

export const getWeeklyAvailability = async () => {
  const response = await api.get("/api/caregivers/me/availability/weekly");
  return response.data.data;
};

export const postWeeklyAvailability = async (data: {
  weekday: string;
  startMin: number;
  endMin: number;
}) => {
  const response = await api.post(
    "/api/caregivers/me/availability/weekly",
    data,
  );
  return response.data;
};

export const deleteWeeklyAvailability = async (id: string) => {
  const response = await api.delete(
    `/api/caregivers/me/availability/weekly/${id}`,
  );
  return response.data;
};

export const getAvailabilityBlocks = async () => {
  const response = await api.get("/api/caregivers/me/availability/blocks");
  return response.data.data;
};

export const postAvailabilityBlock = async (data: {
  startAt: string;
  endAt: string;
  type: string;
}) => {
  const response = await api.post(
    "/api/caregivers/me/availability/blocks",
    data,
  );
  return response.data;
};
