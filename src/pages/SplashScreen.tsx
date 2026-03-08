import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Baby } from "lucide-react";

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background-light dark:bg-background-dark px-6 pb-16 pt-24">
      <div className="flex flex-col items-center justify-center flex-grow space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/20"
        >
          <Baby className="text-primary size-20" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border-4 border-primary/20"
          />
        </motion.div>

        <div className="text-center">
          <h1 className="text-text-light dark:text-text-dark text-3xl font-bold tracking-tight mb-2">
            DayCare
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark text-base font-medium">
            Conectando sua família com segurança
          </p>
        </div>
      </div>

        <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        <div className="w-full flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <p className="text-text-light dark:text-text-dark text-sm font-semibold leading-none">
              Verificando sua sessão
            </p>
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-border-light dark:bg-border-dark overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-text-muted-light dark:text-text-muted-dark text-[10px] text-center italic opacity-60">
          Acessando rede de babás com segurança...
        </p>
      </div>
    </div>
  );
};
