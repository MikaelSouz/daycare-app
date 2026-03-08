import { Search, Bell, Star, MapPin, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: nanniesResponse, isLoading } = useQuery({
    queryKey: ["nannies"],
    queryFn: async () => {
      const res = await api.get("/api/caregivers");
      return res.data.data;
    },
  });

  const nannies = nanniesResponse?.items || [];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
              <img
                src={
                  user?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user?.name || "Visitante"}&background=random`
                }
                alt={user?.name || "User Profile"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                Bem-vinda de volta,
              </p>
              <h1 className="text-base font-bold text-text-light dark:text-text-dark">
                {user?.name || "Visitante"}
              </h1>
            </div>
          </div>
          <button className="relative p-2 text-text-muted-light dark:text-text-muted-dark hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary"></span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted-light dark:text-text-muted-dark">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Encontre uma Babá por nome ou cidade..."
              className="block w-full pl-10 pr-4 py-3 bg-surface-light dark:bg-surface-dark border-none rounded-xl text-sm ring-1 ring-border-light dark:ring-border-dark focus:ring-2 focus:ring-primary transition-all placeholder:text-text-muted-light dark:text-text-muted-dark text-text-light dark:text-text-dark outline-none"
            />
          </div>
        </div>
      </header>

      <main>
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-lg font-bold">Babás Bem Avaliadas</h2>
            <button className="text-sm font-semibold text-primary">
              Ver todas
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
            {nannies.map((nanny: any) => (
              <motion.div
                key={nanny.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/nanny/${nanny.id}`)}
                className="min-w-[160px] w-[160px]"
              >
                <Card className="h-full">
                  <div className="relative h-44">
                    <img
                      src={
                        nanny?.user?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${nanny?.user?.name || "Babá"}&background=random`
                      }
                      alt={nanny?.user?.name || "Babá"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-primary">
                      R${nanny.hourlyRateCents / 100}/h
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold truncate">
                      {nanny?.user?.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-text-muted-light dark:text-text-muted-dark">
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      <span className="text-xs font-medium">
                        {nanny.ratingAvg} ({nanny.ratingCount})
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Profissionais Próximas</h2>
            <div className="flex items-center gap-1 text-primary">
              <MapPin size={14} />
              <span className="text-xs font-semibold">
                {user?.location || "Localização"}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {nannies.map((nanny: any) => (
              <motion.div key={nanny.id} whileTap={{ scale: 0.98 }}>
                <Card
                  onClick={() => navigate(`/nanny/${nanny.id}`)}
                  className="flex items-center p-3"
                >
                  <img
                    src={
                      nanny?.user?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${nanny?.user?.name || "Babá"}&background=random`
                    }
                    alt={nanny?.user?.name || "Babá"}
                    className="size-16 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-bold text-text-light dark:text-text-dark">{nanny?.user?.name}</h3>
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      a 1,2 km • {nanny.experienceYears} anos de exp.
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {nanny?.specialties?.slice(0, 1).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      R${nanny.hourlyRateCents / 100}/h
                    </p>
                    <ChevronRight size={20} className="text-text-muted-light dark:text-text-muted-dark mt-2" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
