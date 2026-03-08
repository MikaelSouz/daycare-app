import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, Lock, QrCode, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  const pixKey =
    "00020126580014br.gov.bcb.pix0136" +
    Math.random().toString(36).substring(2, 15).toUpperCase();

  const subtotal = state.totalAmount || 0;
  const fee = subtotal * 0.1;
  const total = subtotal + fee;

  const breakdown = {
    rate: subtotal / (state.duration || 1) || 0,
    hours: state.duration || 0,
    subtotal: subtotal,
    fee: fee,
    total: total,
  };

  const handleConfirm = async () => {
    if (!state.nannyId) return;
    setIsSubmitting(true);
    try {
      const startDate = new Date(`${state.date}T${state.startTime}:00`);
      const endDate = new Date(
        startDate.getTime() + state.duration * 60 * 60 * 1000,
      );
      const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const weekdayStr = WEEKDAYS[startDate.getDay()];

      const response = await api.post("/api/appointments", {
        caregiverId: state.nannyId,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        hourlyRateCents: Math.round(breakdown.rate * 100),
        totalCents: Math.round(breakdown.total * 100),
        weekday: weekdayStr,
      });

      const appointmentId = response.data?.data?.id || response.data?.id;
      navigate("/success", { state: { appointmentId } });
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert("Erro ao confirmar reserva. Verifique conflitos de horário.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden pb-8">
      <header className="flex items-center bg-surface-light dark:bg-surface-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">
          Pagamento
        </h2>
      </header>

      <div className="p-4">
        <Card className="p-4 flex items-stretch gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-base font-bold text-text-light dark:text-text-dark">{state.nannyName || "Babá"}</p>
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
              Babá Qualificada
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              <p className="text-text-muted-light dark:text-text-muted-dark text-xs">
                {state.date} • {state.startTime}
              </p>
            </div>
          </div>
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-border-light dark:bg-border-dark">
            <img
              src={
                state.nannyAvatar ||
                `https://ui-avatars.com/api/?name=${state.nannyName || "Babá"}&background=random`
              }
              alt={state.nannyName || "Babá"}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </Card>
      </div>

      <h3 className="text-lg font-bold px-4 pb-2 pt-4">Método de Pagamento</h3>
      <div className="flex flex-col gap-3 p-4">
        <label
          className={`flex flex-col gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border-light dark:border-border-dark"}`}
        >
          <div className="flex items-center gap-4 w-full">
            <div className="flex grow flex-col">
              <div className="flex items-center gap-2">
                <QrCode
                  size={20}
                  className={
                    paymentMethod === "pix" ? "text-primary" : "text-text-muted-light dark:text-text-muted-dark"
                  }
                />
                <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                  Pix (Pagamento Instantâneo)
                </p>
              </div>
              <p className="text-text-muted-light dark:text-text-muted-dark text-xs mt-1 ml-7">
                Confirmação imediata
              </p>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "pix"}
              onChange={() => setPaymentMethod("pix")}
              className="h-5 w-5 border-2 border-primary bg-transparent text-primary focus:ring-primary rounded-full"
            />
          </div>

          {paymentMethod === "pix" && (
            <div className="mt-2 p-3 bg-background-light dark:bg-background-dark rounded-lg border border-dashed border-primary/30">
              <p className="text-[10px] text-text-muted-light uppercase font-bold mb-1">
                Copia e Cola
              </p>
              <p className="text-[11px] font-mono break-all text-text-muted-light dark:text-text-muted-dark">
                {pixKey}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(pixKey);
                  alert("Chave Pix copiada!");
                }}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Copiar Chave
              </button>
            </div>
          )}
        </label>

        <label
          className={`flex flex-col gap-4 rounded-xl border p-4 cursor-pointer transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border-light dark:border-border-dark"}`}
        >
          <div className="flex items-center gap-4 w-full">
            <div className="flex grow flex-col">
              <div className="flex items-center gap-2">
                <CreditCard
                  size={20}
                  className={
                    paymentMethod === "card" ? "text-primary" : "text-text-muted-light dark:text-text-muted-dark"
                  }
                />
                <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                  {cardData.number
                    ? `Cartão final ${cardData.number.slice(-4)}`
                    : "Cartão de Crédito"}
                </p>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              onChange={() => {
                setPaymentMethod("card");
                if (!cardData.number) setIsCardModalOpen(true);
              }}
              className="h-5 w-5 border-border-light dark:border-border-dark bg-transparent text-primary focus:ring-primary rounded-full"
            />
          </div>

          {paymentMethod === "card" && !cardData.number && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsCardModalOpen(true);
              }}
              className="mt-2 text-xs text-primary font-bold bg-primary/10 py-2 rounded-lg"
            >
              Configurar Cartão
            </button>
          )}
        </label>
      </div>

      <div className="mt-6 px-4">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-border-light dark:border-border-dark">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-text-light dark:text-text-dark">
            Resumo de Valores
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted-light dark:text-text-muted-dark">
                Valor da Babá (R${breakdown.rate}/h x {breakdown.hours}h)
              </span>
              <span className="font-medium text-text-light dark:text-text-dark">
                R${breakdown.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted-light dark:text-text-muted-dark">
                Taxa da plataforma (10%)
              </span>
              <span className="font-medium text-text-light dark:text-text-dark">R${breakdown.fee.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-border-light dark:border-border-dark flex justify-between items-center">
              <span className="text-base font-bold text-text-light dark:text-text-dark">Valor Total</span>
              <span className="text-xl font-bold text-primary">
                R${breakdown.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 mt-4">
        <Button
          className="w-full gap-2 py-8"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          <Lock size={20} />
          {isSubmitting
            ? "Processando..."
            : `Confirmar e Pagar R$${breakdown.total.toFixed(2)}`}
        </Button>
      </div>

      {/* Modal de Cartão */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl slide-in-from-bottom duration-300 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-text-light dark:text-text-dark">Dados do Cartão</h4>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted-light uppercase">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none text-text-light dark:text-text-dark"
                  value={cardData.number}
                  onChange={(e) =>
                    setCardData({ ...cardData, number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted-light uppercase">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  placeholder="JOÃO SILVA"
                  className="w-full p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none text-text-light dark:text-text-dark"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted-light uppercase">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none text-text-light dark:text-text-dark"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData({ ...cardData, expiry: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold text-text-muted-light uppercase">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary outline-none text-text-light dark:text-text-dark"
                    value={cardData.cvc}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvc: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-8 py-6"
              onClick={() => setIsCardModalOpen(false)}
            >
              Salvar Cartão
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
