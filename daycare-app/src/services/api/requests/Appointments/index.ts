import { api } from "../..";

export const showAppointments = async (id: string) => {
  const response = await api.get(`/api/appointments/${id}`);
  return response.data.data;
};

export const indexAppointments = async () => {
  const response = await api.get(`/api/appointments/`);
  return response.data.data;
};

export const patchConfirmAppointments = async (id: string) => {
  const response = await api.patch(`/api/appointments/${id}/confirm`);
  return response.data.data;
};

export const patchRefuseAppointments = async (id: string) => {
  const response = await api.patch(`/api/appointments/${id}/refuse`);
  return response.data.data;
};
