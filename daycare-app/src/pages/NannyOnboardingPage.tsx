import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fingerprint, ShieldCheck, BadgeCheck, Verified, PlayCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NannyOnboardingPage = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: Fingerprint, title: 'Verificação de Identidade', desc: 'Escaneamento rápido do seu documento de identidade para confirmar quem você é.' },
    { icon: ShieldCheck, title: 'Checagem de Antecedentes', desc: 'Triagem de segurança abrangente realizada por nossos parceiros especializados.' },
    { icon: BadgeCheck, title: 'Perfil Profissional', desc: 'Destaque sua experiência, certificações e habilidades em cuidados infantis.' },
  ];

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-[430px] mx-auto shadow-2xl">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-surface-light dark:bg-surface-dark">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors">
          <ArrowLeft size={24} className="text-text-light dark:text-text-dark" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">Verificação</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <div className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-border-light dark:bg-border-dark rounded-xl min-h-[240px] relative">
            <img 
              src="https://picsum.photos/seed/nanny-verify/600/400" 
              alt="Verificação" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent" />
            <div className="flex p-6 relative z-10">
              <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">Vamos te verificar</h1>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-text-muted-light dark:text-text-muted-dark text-base text-center">
            Para garantir uma comunidade segura para as famílias, todas as babás devem completar um processo de verificação em três etapas antes de entrar.
          </p>
        </div>

        <div className="px-6 py-4 space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <step.icon size={24} />
                </div>
                {i < steps.length - 1 && <div className="w-[2px] bg-primary/30 flex-1 mt-2" />}
              </div>
              <div className="flex flex-col pb-4">
                <p className="text-lg font-semibold leading-tight text-text-light dark:text-text-dark">{step.title}</p>
                <p className="text-text-muted-light dark:text-text-muted-dark text-sm mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-6 my-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
          <Verified size={32} className="text-primary" />
          <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium leading-tight">
            Seus dados são criptografados e tratados com segurança de acordo com nossa política de privacidade.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 border-t border-border-light dark:border-border-dark">
        <Button className="w-full h-14 text-lg" onClick={() => navigate('/nanny/verify/id')}>
          Iniciar Verificação
        </Button>
        <p className="text-text-muted-light/60 dark:text-text-muted-dark/60 text-xs text-center mt-4 font-medium">
          Tempo estimado: 10 minutos
        </p>
      </div>
    </div>
  );
};
