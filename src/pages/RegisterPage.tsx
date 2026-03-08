import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Lock,
  ChevronLeft,
  ArrowRight,
  Baby,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

import { Input } from "../components/ui/Input";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"parent" | "nanny" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError("");

    try {
      const apiRole = role === "parent" ? "RESPONSAVEL" : "CUIDADORA";
      await api.post("/register", { name, email, password, role: apiRole });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao realizar cadastro.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark px-6 py-8">
      <header className="mb-6">
        <button
          onClick={() => navigate("/login")}
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
            Crie sua conta
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
            Junte-se à maior comunidade de cuidados infantis.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div
                className="p-3 mb-4 text-sm text-danger bg-danger/10 rounded-lg border border-danger/20"
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-light dark:text-text-dark ml-1">
                Como você deseja usar o app?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => setRole("parent")}
                    className={`p-4 flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                      role === "parent"
                        ? "border-primary bg-primary-soft dark:bg-primary/10 ring-1 ring-primary"
                        : "border-transparent"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${role === "parent" ? "bg-primary text-white" : "bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark border border-border-light dark:border-border-dark"}`}
                    >
                      <Baby size={24} />
                    </div>
                    <span
                      className={`text-xs font-bold ${role === "parent" ? "text-primary" : "text-text-muted-light dark:text-text-muted-dark"}`}
                    >
                      Responsável
                    </span>
                  </Card>
                </motion.div>

                <motion.div whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => setRole("nanny")}
                    className={`p-4 flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                      role === "nanny"
                        ? "border-primary bg-primary-soft dark:bg-primary/10 ring-1 ring-primary"
                        : "border-transparent"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full ${role === "nanny" ? "bg-primary text-white" : "bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark border border-border-light dark:border-border-dark"}`}
                    >
                      <ShieldCheck size={24} />
                    </div>
                    <span
                      className={`text-xs font-bold ${role === "nanny" ? "text-primary" : "text-text-muted-light dark:text-text-muted-dark"}`}
                    >
                      Babá
                    </span>
                  </Card>
                </motion.div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Nome completo"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
                icon={User}
              />

              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                icon={Mail}
              />

              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                icon={Lock}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={!role}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 shadow-lg transition-all ${
                role
                  ? "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
                  : "bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark border border-border-light dark:border-border-dark cursor-not-allowed shadow-none"
              }`}
            >
              Criar conta
              <ArrowRight size={20} />
            </motion.button>
          </form>
        </motion.div>
      </main>

      <footer className="mt-8 text-center">
        <p className="text-text-muted-light dark:text-text-muted-dark">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline hover:text-primary-hover transition-colors">
            Entrar
          </Link>
        </p>
      </footer>
    </div>
  );
};
