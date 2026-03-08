import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Wallet, 
  Calendar, 
  User, 
  Home, 
  ArrowUpRight,
  History,
  TrendingUp,
  Clock,
  ClipboardList
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { indexAppointments } from '../services/api/requests/Appointments';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

export const EarningsPage = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { data: appointmentsResponse, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: indexAppointments,
    enabled: !!user,
  });

  const appointments = appointmentsResponse?.items || [];
  
  // Histórico: Agendamentos Confirmados ou Concluídos (pode ajustar conforme a regra de negócio)
  const earningsHistory = appointments.filter((app: any) => 
    app.status === 'CONFIRMADO' || app.status === 'CONCLUIDO'
  ).sort((a: any, b: any) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  // Próximo agendamento confirmado (para a data de pagamento)
  const nextConfirmed = appointments
    .filter((app: any) => app.status === 'CONFIRMADO' && new Date(app.startAt) > new Date())
    .sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];

  const nextPayoutDate = nextConfirmed 
    ? format(parseISO(nextConfirmed.startAt), "dd MMM, yyyy", { locale: ptBR })
    : "Nenhum agendado";

  // Cálculo de Saldo (Simplificado: soma de todos os confirmados/concluídos)
  const totalBalanceCents = earningsHistory.reduce((acc: number, app: any) => acc + (app.totalCents || 0), 0);
  const totalBalance = totalBalanceCents / 100;

  return (
    <div className="pb-24 min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border-light dark:border-border-dark">
        <button 
          onClick={() => navigate(-1)}
          className="size-10 flex items-center justify-center rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-text-light dark:text-text-dark">Ganhos</h1>
        <div className="size-10" /> {/* Spacer */}
      </header>

      <main>
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 p-4">
          <Card className="p-5 bg-primary/10 border-primary/20 flex flex-col gap-2">
            <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-semibold uppercase tracking-wider">Saldo Disponível</p>
            <p className="text-text-light dark:text-text-dark text-3xl font-bold">
              {isLoading ? "..." : `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </p>
          </Card>
          <Card className="p-5 flex flex-col gap-2">
            <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-semibold uppercase tracking-wider">Próximo Pagamento</p>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <p className="text-text-light dark:text-text-dark text-xl font-bold">{nextPayoutDate}</p>
            </div>
          </Card>
        </div>

        {/* Withdraw Button */}
        <div className="px-4 py-2">
          <Button 
            className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 gap-2"
          >
            <Wallet size={20} />
            Sacar Fundos
          </Button>
        </div>

        {/* Revenue History Section */}
        <div className="px-4 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Histórico de Receita</h2>
          <button className="text-primary text-sm font-semibold hover:underline">Ver Tudo</button>
        </div>

        {/* History List */}
        <div className="flex flex-col px-4 mb-8">
          {isLoading ? (
            <p className="text-center text-text-muted-light py-8">Carregando histórico...</p>
          ) : earningsHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted-light">
              <History size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Nenhum histórico de receita ainda.</p>
            </div>
          ) : (
            earningsHistory.map((app: any) => (
              <motion.div 
                key={app.id}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-border-light dark:bg-border-dark flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        app.parent?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${app.parent?.name || "Família"}&background=random`
                      }
                      alt={app.parent?.name || "Família"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-text-light dark:text-text-dark font-bold text-sm">{app.parent?.name || 'Responsável'}</p>
                    <p className="text-text-muted-light dark:text-text-muted-dark text-xs mt-0.5">
                      {format(parseISO(app.startAt), "dd MMM, yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-light dark:text-text-dark font-bold text-sm">
                    +R$ {((app.totalCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-text-muted-light/50 dark:text-text-muted-dark/50 text-[10px] font-medium italic">Referente ao serviço</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

    </div>
  );
};
