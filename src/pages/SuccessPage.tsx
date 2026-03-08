import { useNavigate, useLocation } from "react-router-dom";
import { Check, X, MessageSquare, MapPin } from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { showAppointments } from "../services/api/requests/Appointments";

export const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => showAppointments(appointmentId),
    enabled: !!appointmentId,
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <p className="text-text-muted-light font-medium">
          Processando confirmação...
        </p>
      </div>
    );
  }

  const caregiverName = appointment?.caregiver?.name || "Babá";
  const caregiverAvatar =
    appointment?.caregiver?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${caregiverName}&background=random`;

  // O que foi pago é o total (nanny + fee)
  const totalCents = appointment?.totalCents * 1.1;
  const totalAmountFloat = totalCents / 100;

  // Calculando componentes para exibição detalhada (taxa de 10% inclusa)
  const subtotal = totalAmountFloat / 1.1;
  const fee = totalAmountFloat - subtotal;

  const transactionId = appointment?.id
    ? `#CH-${appointment.id.slice(0, 6).toUpperCase()}`
    : "#CH-XXXXXX";

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-[430px] mx-auto">
      <header className="flex items-center bg-transparent p-4 pb-2 justify-between border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">
          Confirmação
        </h2>
      </header>

      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        <div className="relative flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-28 h-28 bg-success/10 rounded-full"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/20"
          >
            <Check size={40} className="text-white" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-bold text-center pb-2 text-text-light dark:text-text-dark">
          Reserva Confirmada!
        </h1>
        <p className="text-text-muted-light dark:text-text-muted-dark text-sm text-center px-4 mb-8">
          Seu pagamento foi aprovado. O valor total abaixo já inclui a taxa de
          serviço de 10%.
        </p>

        <div className="w-full bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark">
          <div className="flex justify-between items-center py-3 border-b border-border-light dark:border-border-dark/50">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
              ID da Transação
            </p>
            <p className="font-mono text-sm font-semibold text-text-light dark:text-text-dark">
              {transactionId}
            </p>
          </div>
          <div className="space-y-2 py-4 border-b border-border-light dark:border-border-dark/50">
            <div className="flex justify-between items-center text-sm">
              <p className="text-text-muted-light dark:text-text-muted-dark font-medium">
                Subtotal
              </p>
              <p className="font-medium text-text-light dark:text-text-dark">
                R$ {subtotal.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-text-muted-light dark:text-text-muted-dark font-medium">
                Taxa de Serviço (10%)
              </p>
              <p className="font-medium text-text-light dark:text-text-dark">
                R$ {fee.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-border-light dark:border-border-dark/50">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
              Valor Total Pago
            </p>
            <p className="text-xl font-bold text-success">
              R$ {totalAmountFloat.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between items-center py-4">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm font-medium">
              Profissional
            </p>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-border-light dark:bg-border-dark overflow-hidden border border-border-light dark:border-border-dark">
                <img
                  src={caregiverAvatar}
                  alt={caregiverName}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-bold text-sm tracking-tight text-text-light dark:text-text-dark">
                {caregiverName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <Button className="w-full" onClick={() => navigate("/bookings")}>
          Ir para Minhas Reservas
        </Button>
        <Button
          variant="secondary"
          className="w-full gap-2"
          onClick={() => navigate("/messages")}
        >
          <MessageSquare size={20} />
          Enviar Mensagem
        </Button>
      </div>
    </div>
  );
};
