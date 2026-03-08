import React, { createContext, useContext, useState, useEffect } from "react";
import { api, queryClient } from "../services/api/index";
import { restoreToken, saveToken } from "../services/storage/index";
import { userData, userKeyToken } from "../services/constants";

export interface User {
  id: string;
  name: string;
  role: "RESPONSAVEL" | "CUIDADORA" | "ADMIN";
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = restoreToken(userKeyToken);
      const storedUser = restoreToken(userData);

      if (storedToken) {
        setToken(storedToken);

        if (storedUser && storedUser !== "null" && storedUser !== "undefined") {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Erro ao fazer parse do usuário salvo", e);
          }
        }

        try {
          const res = await api.get("/api/me");
          const fetchedUser = res.data?.data || res.data;

          if (fetchedUser && fetchedUser.id) {
            setUser(fetchedUser);
            saveToken(userData, JSON.stringify(fetchedUser));
          }
        } catch (error) {
          console.error("Failed to authenticate user", error);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    saveToken(userKeyToken, newToken);
    saveToken(userData, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(userKeyToken);
    localStorage.removeItem(userData);
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
