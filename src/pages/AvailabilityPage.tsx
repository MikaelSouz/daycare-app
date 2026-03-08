import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Repeat,
  Info,
  Clock,
  Home,
  ClipboardList,
  Wallet,
  User as UserIcon,
} from "lucide-react";
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
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWeeklyAvailability,
  postWeeklyAvailability,
  deleteWeeklyAvailability,
  AvailabilityWeekly,
} from "../services/api/requests/Availability";
import { cn } from "../lib/utils";

export const AvailabilityPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAvailable, setIsAvailable] = useState(true);
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newStartTime, setNewStartTime] = useState("08:00");
  const [newEndTime, setNewEndTime] = useState("18:00");

  // Buscar disponibilidades semanais
  const { data: weeklyAvailability = [], isLoading } = useQuery<
    AvailabilityWeekly[]
  >({
    queryKey: ["availability-weekly"],
    queryFn: getWeeklyAvailability,
  });

  const addMutation = useMutation({
    mutationFn: postWeeklyAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-weekly"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWeeklyAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-weekly"] });
    },
  });

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0",
    )} ${period}`;
  };

  const getWeekdayAvailability = (date: Date) => {
    const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const weekdayStr = WEEKDAYS[date.getDay()];
    return weeklyAvailability.filter((a) => a.weekday === weekdayStr);
  };

  const selectedDaySlots = getWeekdayAvailability(selectedDate);

  const handleSaveNewSlot = () => {
    const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const [startH, startM] = newStartTime.split(":").map(Number);
    const [endH, endM] = newEndTime.split(":").map(Number);
    
    addMutation.mutate(
      {
        weekday: WEEKDAYS[selectedDate.getDay()],
        startMin: startH * 60 + startM,
        endMin: endH * 60 + endM,
      },
      {
        onSuccess: () => {
          setIsAddingSlot(false);
          setNewStartTime("08:00");
          setNewEndTime("18:00");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto relative shadow-2xl pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center bg-surface-light dark:bg-surface-dark p-4 pb-2 justify-between border-b border-border-light dark:border-border-dark backdrop-blur-md">
        <button
          onClick={() => navigate("/nanny/dashboard")}
          className="p-2 text-text-muted-light dark:text-text-muted-dark hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-text-light dark:text-text-dark">Disponibilidade</h1>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Check size={24} className="font-bold" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pt-4 space-y-6">
        {/* Calendar Section */}
        <div className="px-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <p className="font-bold capitalize text-text-light dark:text-text-dark">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </p>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, idx) => (
                <p
                  key={`${day}-${idx}`}
                  className="text-text-muted-light dark:text-text-muted-dark text-[10px] font-bold h-8 flex items-center justify-center"
                >
                  {day}
                </p>
              ))}

              {daysInMonth.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const hasAvailability = getWeekdayAvailability(day).length > 0;

                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className="group relative h-10 w-full"
                  >
                    <div
                      className={cn(
                        "flex size-full items-center justify-center rounded-full text-sm font-medium transition-all",
                        isSelected
                          ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                          : isCurrentMonth
                            ? "hover:bg-border-light dark:hover:bg-border-dark text-text-light dark:text-text-dark"
                            : "text-text-muted-light/30 dark:text-text-muted-dark/30 pointer-events-none",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {hasAvailability && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detail Editor */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-primary/20 text-primary dark:bg-primary/10 rounded-full uppercase">
              {format(selectedDate, "EEEE", { locale: ptBR })}
            </span>
          </div>

          {/* Status Toggle */}
          <div className="flex bg-border-light dark:bg-border-dark p-1 rounded-xl">
            <button
              onClick={() => setIsAvailable(true)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                isAvailable
                  ? "bg-surface-light dark:bg-surface-dark shadow-sm text-primary"
                  : "text-text-muted-light dark:text-text-muted-dark",
              )}
            >
              Disponível
            </button>
            <button
              onClick={() => setIsAvailable(false)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                !isAvailable
                  ? "bg-surface-light dark:bg-surface-dark shadow-sm text-danger"
                  : "text-text-muted-light dark:text-text-muted-dark",
              )}
            >
              Indisponível
            </button>
          </div>

          {/* Time Slots */}
          <AnimatePresence>
            {isAvailable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4"
              >
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-muted-light dark:text-text-muted-dark">
                      Horário de Trabalho
                    </p>
                    <button
                      onClick={() => setIsAddingSlot(true)}
                      className="text-primary text-xs font-bold flex items-center gap-1"
                      disabled={isAddingSlot}
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {isAddingSlot && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="time"
                            value={newStartTime}
                            onChange={(e) => setNewStartTime(e.target.value)}
                            className="w-full px-3 py-1.5 bg-background-light dark:bg-background-dark rounded-lg border border-primary/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-light dark:text-text-dark"
                          />
                        </div>
                        <span className="text-text-muted-light dark:text-text-muted-dark text-xs italic">
                          até
                        </span>
                        <div className="flex-1">
                          <input
                            type="time"
                            value={newEndTime}
                            onChange={(e) => setNewEndTime(e.target.value)}
                            className="w-full px-3 py-1.5 bg-background-light dark:bg-background-dark rounded-lg border border-primary/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-light dark:text-text-dark"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleSaveNewSlot}
                            className="p-1 text-success hover:text-success/80 transition-colors"
                            disabled={addMutation.isPending}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setIsAddingSlot(false)}
                            className="p-1 text-text-muted-light hover:text-danger transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedDaySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-3">
                        <div className="flex-1 flex items-center justify-between px-3 py-2 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">
                            {formatMinutes(slot.startMin)}
                          </span>
                          <Clock size={16} className="text-text-muted-light dark:text-text-muted-dark" />
                        </div>
                        <span className="text-text-muted-light dark:text-text-muted-dark text-xs italic">
                          até
                        </span>
                        <div className="flex-1 flex items-center justify-between px-3 py-2 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                          <span className="text-sm font-medium text-text-light dark:text-text-dark">
                            {formatMinutes(slot.endMin)}
                          </span>
                          <Clock size={16} className="text-text-muted-light dark:text-text-muted-dark" />
                        </div>
                        <button
                          onClick={() => deleteMutation.mutate(slot.id)}
                          className="p-1 text-text-muted-light/30 dark:text-text-muted-dark/30 hover:text-danger transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {selectedDaySlots.length === 0 && (
                      <p className="text-center text-xs text-text-muted-light dark:text-text-muted-dark py-2">
                        Nenhum horário definido para este dia da semana.
                      </p>
                    )}
                  </div>

                  <hr className="border-border-light dark:border-border-dark" />

                  {/* Repeat Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Repeat size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                          Repetir Semanalmente
                        </p>
                        <p className="text-[10px] text-text-muted-light dark:text-text-muted-dark">
                          Aplicar a todas as{" "}
                          {format(selectedDate, "EEEE", { locale: ptBR })}s
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRepeatWeekly(!repeatWeekly)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                        repeatWeekly
                          ? "bg-primary"
                          : "bg-border-light dark:bg-border-dark",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-4 transform rounded-full bg-white transition-transform",
                          repeatWeekly ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Card */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 flex gap-3">
            <Info size={20} className="text-primary shrink-0" />
            <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark leading-relaxed">
              Os pais só podem agendar você durante suas horas "Disponíveis".
              Enviaremos uma notificação para cada nova solicitação.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

