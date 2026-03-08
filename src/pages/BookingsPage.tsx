import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Info,
  X,
} from "lucide-react";
import { format, parseISO, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { indexAppointments } from "../services/api/requests/Appointments";

export const BookingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: appointmentsResponse, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: indexAppointments,
  });
  const allBookings = appointmentsResponse?.items || [];

  const bookings = allBookings.filter((b: any) => {
    if (activeTab === "upcoming") return b.status === "CONFIRMADO";
    if (activeTab === "pending") return b.status === "PENDENTE";
    return !["CONFIRMADO", "PENDENTE"].includes(b.status);
  });

  const tabs = [
    { id: "upcoming", label: "Próximas" },
    { id: "pending", label: "Pendentes" },
    { id: "past", label: "Passadas" },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 border-b border-border-light dark:border-border-dark shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">
          Minhas Reservas
        </h1>
      </header>

      <nav className="bg-background-light dark:bg-background-dark shrink-0">
        <div className="flex border-b border-border-light dark:border-border-dark px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 pb-3 pt-4 text-sm font-medium transition-all border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-text-muted-light dark:text-text-muted-dark",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark/50 p-4 space-y-4 pb-24">
        {isLoading && (
          <p className="text-center text-text-muted-light p-4">
            Carregando reservas...
          </p>
        )}
        {!isLoading && bookings.length === 0 && (
          <p className="text-center text-text-muted-light p-4">
            Nenhuma reserva encontrada aqui.
          </p>
        )}
        {bookings.map((booking: any) => {
          const start = parseISO(booking.startAt);
          const end = parseISO(booking.endAt);
          const dateFormatted = format(start, "EEE, d 'de' MMMM", {
            locale: ptBR,
          });
          const startTime = format(start, "HH:mm");
          const endTime = format(end, "HH:mm");
          const duration = differenceInHours(end, start);

          return (
            <div key={booking.id}>
              <Card className="flex flex-col">
                <div className="flex p-4 gap-4">
                  <div className="size-16 shrink-0 rounded-lg overflow-hidden bg-border-light dark:bg-border-dark flex items-center justify-center font-bold text-text-muted-light">
                    <img
                      src={
                        booking.caregiver?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${booking.caregiver?.name || "Babá"}&background=random`
                      }
                      alt={booking.caregiver?.name || "Babá"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold truncate text-text-light dark:text-text-dark">
                        {booking.caregiver?.name || "Babá"}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          booking.status === "CONFIRMADO"
                            ? "bg-success/10 text-success"
                            : booking.status === "PENDENTE"
                              ? "bg-warning/10 text-warning"
                              : "bg-danger/10 text-danger",
                        )}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-0.5">
                      Profissional de Cuidados Infantis
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-background-light/50 dark:bg-surface-dark/30 border-t border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark">
                    <Calendar size={16} />
                    <p className="text-sm font-medium capitalize text-text-light dark:text-text-dark">
                      {dateFormatted}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-text-muted-light dark:text-text-muted-dark">
                    <Clock size={16} />
                    <p className="text-sm font-medium text-text-light dark:text-text-dark">
                      {startTime} - {endTime} ({duration}h)
                    </p>
                  </div>
                </div>

                <div className="p-4 flex gap-3">
                  {booking.status === "CONFIRMADO" ? (
                    <>
                      <Button className="flex-1 gap-2" size="sm">
                        <MessageSquare size={18} />
                        Contato
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        <Info size={18} />
                        Detalhes
                      </Button>
                    </>
                  ) : booking.status === "PENDENTE" ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 text-danger border-danger/20"
                        size="sm"
                      >
                        <X size={18} />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      className="flex-1 gap-2"
                      size="sm"
                      onClick={() => navigate(`/book/${booking.caregiverId}`)}
                    >
                      Reagendar
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </main>
    </div>
  );
};
