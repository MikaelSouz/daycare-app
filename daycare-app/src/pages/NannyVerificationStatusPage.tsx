import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Search, UserSearch, History, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';

export const NannyVerificationStatusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden max-w-md mx-auto shadow-2xl border-x border-primary/10">
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors">
          <ArrowLeft size={24} className="text-text-light dark:text-text-dark" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-10 text-text-light dark:text-text-dark">Status da Verificação</h2>
      </header>

      <div className="flex flex-col flex-1 px-6 pt-8 pb-20">
        <div className="w-full flex justify-center mb-8">
          <div className="relative w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            <div className="z-10 flex flex-col items-center">
              <CheckCircle size={80} className="text-primary mb-2" />
              <div className="flex gap-2">
                <Search size={24} className="text-primary animate-pulse" />
                <UserSearch size={24} className="text-primary/60" />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-light dark:bg-surface-dark px-4 py-2 rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-text-light dark:text-text-dark">Analisando</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-3 text-text-light dark:text-text-dark">Estamos analisando seu perfil</h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-base leading-relaxed">
            Nossa equipe está revisando manualmente seus documentos para manter nossos padrões de segurança. Isso geralmente leva de <span className="text-primary font-semibold">24 a 48 horas</span>.
          </p>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-border-light dark:border-border-dark mb-8">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-text-light dark:text-text-dark">
            <History size={20} className="text-primary" />
            Lista de Progresso
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-primary" />
                <span className="font-medium text-text-light dark:text-text-dark">Verificação de Identidade</span>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">CONCLUÍDO</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History size={20} className="text-primary" />
                <span className="font-medium text-text-light dark:text-text-dark">Antecedentes Criminais</span>
              </div>
              <span className="text-xs font-bold text-text-muted-light bg-border-light dark:bg-border-dark px-2 py-1 rounded">PROCESSANDO</span>
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-text-muted-light dark:text-text-muted-dark" />
                <span className="font-medium text-text-light dark:text-text-dark">Certificações</span>
              </div>
              <span className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark">AGUARDANDO</span>
            </div>
          </div>
        </div>

        <Button className="w-full gap-2" onClick={() => navigate('/nanny/dashboard')}>
          Explorar Dicas para Babás
        </Button>
      </div>
    </div>
  );
};
