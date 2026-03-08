import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { showCaregivers } from "../services/api/requests/Caregivers";

export const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: nanny, isLoading } = useQuery({
    queryKey: ["caregiver", id],
    queryFn: () => showCaregivers(id),
    enabled: !!id,
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [duration, setDuration] = useState(4);

  const weeklyAvailability = nanny?.user?.weeklyAvailability || [];

  const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Verifica se uma data específica (Date) possui algum horário disponível na semana
  const isDateAvailable = (date: Date) => {
    // Não permitir datas passadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    // Se a cuidadora não tiver configurado nada, liberamos (ou restringimos, mas liberar no MVP é mais seguro)
    if (!weeklyAvailability || weeklyAvailability.length === 0) return true;

    const weekdayStr = WEEKDAYS[date.getDay()];
    return weeklyAvailability.some((av: any) => av.weekday === weekdayStr);
  };

  // Calcula os slots de horas com base no dia selecionado
  const availableTimeSlots = useMemo(() => {
    // Fallback padrão se não vier da API
    const defaultSlots = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];

    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      return defaultSlots;
    }

    const weekdayStr = WEEKDAYS[selectedDate.getDay()];
    const dayAvailabilities = weeklyAvailability.filter(
      (av: any) => av.weekday === weekdayStr,
    );

    if (dayAvailabilities.length === 0) return [];

    const slots = [];

    // Para simplificar, gera slots de 1 em 1 hr para todas as aberturas do dia da semana
    for (const av of dayAvailabilities) {
      let currentMin = av.startMin;
      // Garante que o slot tenha espaço para pelo menos mostrar
      while (currentMin + 60 <= av.endMin) {
        // Incrementa de 60 em 60 mins
        const h = Math.floor(currentMin / 60);
        const m = currentMin % 60;
        const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        if (!slots.includes(timeStr)) slots.push(timeStr);
        currentMin += 60;
      }
    }

    return slots.sort();
  }, [selectedDate, weeklyAvailability]);

  // Se a hora selecionada não existir no novo dia, redefine para a primeira disponível
  useMemo(() => {
    if (
      availableTimeSlots.length > 0 &&
      !availableTimeSlots.includes(selectedTime)
    ) {
      setSelectedTime(availableTimeSlots[0]);
    }
  }, [availableTimeSlots, selectedTime]);

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const totalAmount = duration * ((nanny?.hourlyRateCents || 0) / 100);

  if (isLoading)
    return (
      <div className="p-8 text-center text-text-muted-light">Carregando perfil...</div>
    );
  if (!nanny)
    return (
      <div className="p-8 text-center text-red-500">Babá não encontrada.</div>
    );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-md mx-auto border-x border-border-light dark:border-border-dark">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">
          Reservar Babá
        </h2>
      </header>

      <div className="flex p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex gap-4 items-center">
          <div className="size-16 rounded-full border-2 border-border-light dark:border-border-dark overflow-hidden">
            <img
              src={
                nanny?.user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${nanny?.user?.name || "Babá"}&background=random`
              }
              alt={nanny?.user?.name || "Babá"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="text-lg font-bold text-text-light dark:text-text-dark">{nanny?.user?.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={14} className="text-warning fill-warning" />
              <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
                {nanny.ratingAvg} ({nanny.ratingCount} avaliações)
              </p>
            </div>
            <p className="text-primary text-sm font-semibold mt-0.5">
              R${(nanny.hourlyRateCents / 100).toFixed(2)} / hora
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-4">
          <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-border-light dark:border-border-dark">
            <div className="flex items-center p-1 justify-between mb-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <p className="text-base font-bold capitalize text-text-light dark:text-text-dark">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </p>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, index) => (
                <p
                  key={`${d}-${index}`}
                  className="text-text-muted-light dark:text-text-muted-dark text-[11px] font-bold uppercase h-8 flex items-center justify-center"
                >
                  {d}
                </p>
              ))}
              {daysInMonth.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const available = isDateAvailable(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => available && setSelectedDate(day)}
                    disabled={!available}
                    className={cn(
                      "h-10 w-full rounded-full text-sm font-medium flex items-center justify-center transition-colors relative",
                      !available && "opacity-30 cursor-not-allowed",
                      isSelected
                        ? "bg-primary text-white font-bold"
                        : isCurrentMonth && available
                          ? "text-text-light dark:text-text-dark hover:bg-border-light dark:hover:bg-border-dark"
                          : "text-text-muted-light/30 dark:text-text-muted-dark/30",
                      !isCurrentMonth && "pointer-events-none opacity-0", // Esconde dias de outros meses para clean UI
                    )}
                  >
                    {format(day, "d")}
                    {!available &&
                      isCurrentMonth &&
                      day >= new Date().setHours(0, 0, 0, 0) && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 border-b border-danger rotate-45 pointer-events-none"></div>
                      )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-lg font-bold mb-4">Horário de Início</h3>

          {availableTimeSlots.length === 0 ? (
            <div className="p-4 text-center bg-surface-light dark:bg-surface-dark rounded-xl text-text-muted-light border border-border-light dark:border-border-dark">
              <p className="text-sm font-medium">
                Nenhum horário disponível para este dia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                    selectedTime === time
                      ? "border-2 border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark focus:outline-none hover:border-primary/50",
                  )}
                >
                  <span className="text-sm font-bold">{time}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-4 mb-12">
          <h3 className="text-lg font-bold mb-4">Duração</h3>
          <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
            <button
              onClick={() => setDuration(Math.max(1, duration - 1))}
              className="size-10 flex items-center justify-center rounded-full bg-background-light dark:bg-background-dark shadow-sm border border-border-light dark:border-border-dark"
            >
              <Minus size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-text-light dark:text-text-dark">{duration} Horas</span>
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider font-semibold">
                {selectedTime} - {parseInt(selectedTime) + duration}:00
              </span>
            </div>
            <button
              onClick={() => setDuration(duration + 1)}
              className="size-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark p-6 border-t border-border-light dark:border-border-dark shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
              Total Estimado
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-text-light dark:text-text-dark">
                R${totalAmount.toFixed(2)}
              </span>
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                ({duration}h R${(nanny.hourlyRateCents / 100).toFixed(2)}/h)
              </span>
            </div>
          </div>
          <div className="flex items-center text-primary gap-1">
            <Info size={16} />
            <span className="text-xs font-semibold">Mais taxas</span>
          </div>
        </div>
        <Button
          className="w-full gap-2"
          onClick={() =>
            navigate("/checkout", {
              state: {
                nannyId: nanny?.user?.id,
                nannyName: nanny?.user?.name,
                nannyAvatar: nanny?.user?.avatarUrl,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime: selectedTime,
                duration,
                totalAmount,
              },
            })
          }
        >
          <span>Confirmar Reserva</span>
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};

const Star = ({ size, className }: { size: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
