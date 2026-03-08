import { api } from "../..";

export const showCaregivers = async (id: string) => {
  const response = await api.get(`/api/caregivers/${id}`);
  return response.data.data;
};

export const showMeCaregivers = async () => {
  const response = await api.get(`/api/caregivers/me`);
  return response.data.data;
};

export const indexCaregivers = async () => {
  const response = await api.get(`/api/caregivers/`);
  return response.data.data;
};

export const indexCaregiverReviews = async (id: string) => {
  const response = await api.get(`/api/caregivers/${id}/reviews`);
  return response.data.data?.items || response.data.data || [];
};
