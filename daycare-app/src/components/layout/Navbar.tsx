import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Search,
  Plus,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export const Navbar = () => {
  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Calendar, label: "Reservas", path: "/bookings" },
    { icon: MessageSquare, label: "Mensagens", path: "/messages" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-border-light dark:border-border-dark px-6 py-2 pb-8 flex justify-between items-center z-50">
      {navItems.map((item, index) => {
        return (
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
                    "text-[10px]",
                    isActive ? "font-bold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
