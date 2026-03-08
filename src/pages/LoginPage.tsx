import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, ChevronLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { postLogin } from "../services/api/requests/Auth";

import { Input } from "../components/ui/Input";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await postLogin({ email, password });
      await login(data.token, data.user);
      // Redireciona com base na role do usuário
      if (data.user?.role === "CUIDADORA") {
        navigate("/nanny/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao realizar login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark px-6 py-8">
      <header className="mb-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-text-muted-light dark:text-text-muted-dark hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-8">
            Entre para continuar cuidando ou encontrando a babá perfeita.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                className="p-3 mb-4 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20"
                role="alert"
              >
                {error}
              </div>
            )}
            
            <Input
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              icon={Mail}
            />

            <Input
              label="Senha"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline hover:text-primary-hover"
              >
                Esqueceu a senha?
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-colors"
            >
              Entrar
              <ArrowRight size={20} />
            </motion.button>
          </form>
        </motion.div>
      </main>

      <footer className="mt-8 text-center">
        <p className="text-text-muted-light dark:text-text-muted-dark">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline hover:text-primary-hover transition-colors"
          >
            Cadastre-se
          </Link>
        </p>
      </footer>
    </div>
  );
};
