import { 
  Home, 
  MessageSquare, 
  ClipboardList, 
  Calendar, 
  Wallet, 
  User as UserIcon 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export const NannyNavbar = () => {
  const navItems = [
    { icon: Home, label: "Início", path: "/nanny/dashboard" },
    { icon: MessageSquare, label: "Mensagens", path: "/messages" },
    { icon: ClipboardList, label: "Reservas", path: "/nanny/bookings" },
    { icon: Calendar, label: "Agenda", path: "/nanny/availability" },
    { icon: Wallet, label: "Ganhos", path: "/nanny/earnings" },
    { icon: UserIcon, label: "Perfil", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark px-4 py-2 pb-8 flex justify-between items-center z-50 max-w-[430px] mx-auto">
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive
                ? "text-primary"
                : "text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark",
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon size={22} />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  isActive ? "opacity-100" : "opacity-80",
                )}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
