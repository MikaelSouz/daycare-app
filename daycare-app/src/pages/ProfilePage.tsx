import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: User, label: "Informações Pessoais", path: "/profile/edit" },
    { icon: Settings, label: "Configurações", path: "#" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pb-24">
      <header className="p-4 flex items-center justify-between bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-text-light dark:text-text-dark" />
        </button>
        <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Perfil</h1>
        <div className="w-10" />
      </header>

      <main className="px-4">
        <div className="flex flex-col items-center py-8">
          <div className="size-24 rounded-full border-4 border-border-light dark:border-border-dark overflow-hidden mb-4 shadow-sm">
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.name || "Visitante"}&background=random`
              }
              alt={user?.name || "User"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">{user?.name || "Visitante"}</h2>
          <p className="text-text-muted-light dark:text-text-muted-dark font-medium whitespace-break-spaces">
            Conta de {user?.role === "CUIDADORA" ? "Babá" : "Responsável"}
          </p>
        </div>

        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <div key={i}>
              <Card
                onClick={() => navigate(item.path)}
                className="flex items-center p-4"
              >
                <div className="size-10 rounded-xl bg-border-light dark:bg-border-dark flex items-center justify-center text-text-muted-light dark:text-text-muted-dark mr-4">
                  <item.icon size={20} />
                </div>
                <span className="flex-1 font-semibold text-text-light dark:text-text-dark">{item.label}</span>
                <ChevronRight size={20} className="text-text-muted-light" />
              </Card>
            </div>
          ))}

          <Card
            onClick={handleLogout}
            className="flex items-center p-4 text-danger border-danger/20 cursor-pointer hover:bg-danger/5 transition-colors"
          >
            <div className="size-10 rounded-xl bg-danger/10 flex items-center justify-center mr-4">
              <LogOut size={20} />
            </div>
            <span className="flex-1 font-bold">Sair</span>
          </Card>
        </div>
      </main>
    </div>
  );
};
