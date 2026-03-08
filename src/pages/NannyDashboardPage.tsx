import {
  Star,
  Briefcase,
  MapPin,
  Navigation,
  MessageSquare,
  TrendingUp,
  Check,
  X,
  Home,
  Calendar,
  Wallet,
  User as UserIcon,
  Info,
  ClipboardList,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import {
  indexAppointments,
  patchConfirmAppointments,
  patchRefuseAppointments,
} from "../services/api/requests/Appointments";
import {
  showCaregivers,
  showMeCaregivers,
} from "../services/api/requests/Caregivers";
import { format, parseISO, differenceInHours, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

export const NannyDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar Agendamentos
  const { data: appointmentsResponse } = useQuery({
    queryKey: ["appointments"],
    queryFn: indexAppointments,
    enabled: !!user,
  });

  const appointments = appointmentsResponse?.items || [];
  const pendingRequests = appointments.filter(
    (app: any) => app.status === "PENDENTE",
  );
  const todayAppointments = appointments.filter(
    (app: any) => app.status === "CONFIRMADO" && isToday(parseISO(app.startAt)),
  );

  // Buscar Status (Perfil Cuidadora) para Rating/Total
  const { data: nannyData } = useQuery({
    queryKey: ["caregiver", user?.id],
    queryFn: showMeCaregivers,
    enabled: !!user?.id,
  });

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

  const stats = [
    {
      label: "Avaliação",
      value: nannyData?.ratingAvg || "0.0",
      trend: "",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Total de Trabalhos",
      value: nannyData?.ratingCount || "0",
      trend: "",
      icon: Briefcase,
      color: "text-primary",
    },
  ];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.name || "Babá"}&background=random`
              }
              alt="Perfil"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
              Bem-vinda de volta,
            </h1>
            <p className="text-lg font-bold leading-tight text-text-light dark:text-text-dark">
              {user?.name || "Babá"}
            </p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors">
          <TrendingUp size={20} className="text-primary" />
        </button>
      </header>

      <main className="px-4">
        <div className="py-6 grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i}>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={18} className={stat.color} />
                  <span className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 text-text-light dark:text-text-dark">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs font-medium text-success">
                    {stat.trend}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Agenda de Hoje</h2>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">
              {format(new Date(), "dd MMM", { locale: ptBR })}
            </span>
          </div>
          {todayAppointments.length > 0 ? (
            todayAppointments.map((app: any) => {
              const start = parseISO(app.startAt);
              const end = parseISO(app.endAt);
              const duration = differenceInHours(end, start);

              return (
                <div key={app.id}>
                  <Card className="overflow-hidden mb-4">
                    <div className="p-4 border-b border-border-light dark:border-border-dark/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-3">
                          <img
                            src={
                              app.parent?.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${app.parent?.name || "Família"}&background=random`
                            }
                            className="size-12 rounded-lg object-cover"
                            alt="Família"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-bold text-text-light dark:text-text-dark">
                              {app.parent?.name || "Família"}
                            </h3>
                            <div className="flex items-center gap-1 text-text-muted-light dark:text-text-muted-dark text-sm mt-0.5">
                              <MapPin size={14} />
                              <span>São Paulo, SP</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">
                            {format(start, "HH:mm")} - {format(end, "HH:mm")}
                          </p>
                          <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-medium uppercase mt-1">
                            {duration} Horas de Duração
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2" size="sm">
                          <Navigation size={18} />
                          Ver Rota
                        </Button>
                        <Button variant="secondary" className="px-4" size="sm">
                          <MessageSquare size={18} />
                        </Button>
                      </div>
                    </div>
                    {app.notes && (
                      <div className="bg-primary/5 dark:bg-primary/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-text-muted-light dark:text-text-muted-dark">
                          <Info size={14} className="text-primary" />
                          <span>{app.notes}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })
          ) : (
            <Card className="p-8 text-center bg-background-light/50 dark:bg-surface-dark/30 border-dashed border-2 border-border-light dark:border-border-dark">
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
                Nenhum agendamento confirmado para hoje.
              </p>
            </Card>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Novas Solicitações</h2>
            <span className="size-6 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold">
              {pendingRequests.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingRequests.map((req: any, i: number) => (
              <div key={i}>
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-border-light overflow-hidden flex items-center justify-center font-bold text-text-muted-light">
                      <img
                        src={`https://ui-avatars.com/api/?name=${req.parent?.name || "Responsável"}&background=random`}
                        alt={req.parent?.name || "Responsável"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-text-light dark:text-text-dark">
                        {req.parent?.name || "Responsável"}
                      </h4>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        {format(parseISO(req.startAt), "dd/MM")} •{" "}
                        {format(parseISO(req.startAt), "HH:mm")} -{" "}
                        {format(parseISO(req.endAt), "HH:mm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-success">
                        R${(req.totalCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-success hover:bg-success/90"
                      size="sm"
                      onClick={() => acceptMutation.mutate(req.id)}
                      disabled={acceptMutation.isPending}
                    >
                      Aceitar
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      size="sm"
                      onClick={() => refuseMutation.mutate(req.id)}
                      disabled={refuseMutation.isPending}
                    >
                      Recusar
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <p className="text-text-muted-light text-sm text-center py-4">
                Nenhuma nova solicitação.
              </p>
            )}
          </div>
        </section>
      </main>

    </div>
  );
};
