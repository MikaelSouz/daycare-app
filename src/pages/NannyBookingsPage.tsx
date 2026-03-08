import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MessageSquare,
  Info,
  Check,
  X,
  Home,
  Wallet,
  User as UserIcon,
  ClipboardList,
} from "lucide-react";
import { format, parseISO, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  indexAppointments,
  patchConfirmAppointments,
  patchRefuseAppointments,
} from "../services/api/requests/Appointments";

export const NannyBookingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: appointmentsResponse, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: indexAppointments,
  });

  const allBookings = appointmentsResponse?.items || [];

  // Filtra os agendamentos conforme a aba ativa
  const bookings = allBookings.filter((b: any) => {
    if (activeTab === "confirmed") return b.status === "CONFIRMADO";
    if (activeTab === "pending") return b.status === "PENDENTE";
    if (activeTab === "cancelled")
      return b.status === "CANCELADO" || b.status === "RECUSADO";
    return false;
  });

  const tabs = [
    { id: "pending", label: "Pendentes" },
    { id: "confirmed", label: "Confirmados" },
    { id: "cancelled", label: "Cancelados" },
  ];

  // Mutations para aceitar/recusar
  const acceptMutation = useMutation({
    mutationFn: (id: string) => patchConfirmAppointments(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const refuseMutation = useMutation({
    mutationFn: (id: string) => patchRefuseAppointments(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  // Contadores para cada aba
  const pendingCount = allBookings.filter(
    (b: any) => b.status === "PENDENTE",
  ).length;
  const confirmedCount = allBookings.filter(
    (b: any) => b.status === "CONFIRMADO",
  ).length;
  const cancelledCount = allBookings.filter(
    (b: any) => b.status === "CANCELADO" || b.status === "RECUSADO",
  ).length;

  const tabCounts: Record<string, number> = {
    pending: pendingCount,
    confirmed: confirmedCount,
    cancelled: cancelledCount,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-4 border-b border-border-light dark:border-border-dark">
        <h1 className="text-xl font-bold text-center text-text-light dark:text-text-dark">Meus Agendamentos</h1>
      </header>

      {/* Tabs de navegação */}
      <nav className="bg-background-light dark:bg-background-dark shrink-0">
        <div className="flex border-b border-border-light dark:border-border-dark px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 pb-3 pt-4 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-1.5",
                activeTab === tab.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-text-muted-light dark:text-text-muted-dark",
              )}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span
                  className={cn(
                    "size-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark border border-border-light dark:border-border-dark",
                  )}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Lista de agendamentos */}
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark/50 p-4 space-y-4">
        {isLoading && (
          <p className="text-center text-text-muted-light p-8">
            Carregando agendamentos...
          </p>
        )}
        {!isLoading && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="size-16 rounded-full bg-border-light dark:bg-border-dark flex items-center justify-center">
              <ClipboardList
                size={28}
                className="text-text-muted-light dark:text-text-muted-dark"
              />
            </div>
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
              Nenhum agendamento encontrado aqui.
            </p>
          </div>
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
                {/* Informações do responsável */}
                <div className="flex p-4 gap-4">
                  <div className="size-14 shrink-0 rounded-lg overflow-hidden bg-border-light flex items-center justify-center">
                    <img
                      src={
                        booking.parent?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${booking.parent?.name || "Responsável"}&background=random`
                      }
                      alt={booking.parent?.name || "Responsável"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold truncate text-text-light dark:text-text-dark">
                        {booking.parent?.name || "Responsável"}
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
                    <p className="text-primary text-sm font-semibold mt-0.5">
                      R${((booking.totalCents || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Data e horário */}
                <div className="px-4 py-3 bg-background-light/50 dark:bg-surface-dark/30 border-t border-border-light dark:border-border-dark">
                  <div className="flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark">
                    <Calendar size={16} />
                    <p className="text-sm font-medium capitalize">
                      {dateFormatted}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-text-muted-light dark:text-text-muted-dark">
                    <Clock size={16} />
                    <p className="text-sm font-medium">
                      {startTime} - {endTime} ({duration}h)
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="p-4 flex gap-3">
                  {booking.status === "PENDENTE" ? (
                    <>
                      <Button
                        className="flex-1 gap-2 bg-success hover:bg-success/90"
                        size="sm"
                        onClick={() => acceptMutation.mutate(booking.id)}
                        disabled={acceptMutation.isPending}
                      >
                        <Check size={18} />
                        Aceitar
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1 gap-2 text-danger hover:text-danger/80"
                        size="sm"
                        onClick={() => refuseMutation.mutate(booking.id)}
                        disabled={refuseMutation.isPending}
                      >
                        <X size={18} />
                        Recusar
                      </Button>
                    </>
                  ) : booking.status === "CONFIRMADO" ? (
                    <>
                      <Button className="flex-1 gap-2" size="sm">
                        <MessageSquare size={18} />
                        Mensagem
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
                  ) : (
                    <div className="w-full text-center">
                      <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium italic">
                        Este agendamento foi cancelado/recusado.
                      </p>
                    </div>
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
