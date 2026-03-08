import { api } from "../..";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "RESPONSAVEL" | "CUIDADORA" | "ADMIN";
    avatarUrl?: string;
  };
}

export const postLogin = async (data: any): Promise<LoginResponse> => {
  const response = await api.post("/api/login", data);
  return response.data;
};

export const postRegister = async (data: any): Promise<any> => {
  const response = await api.post("/api/register", data);
  return response.data;
};
