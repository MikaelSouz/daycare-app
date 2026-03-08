import { differenceInYears, parseISO } from "date-fns";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Star,
  Verified,
  Heart,
  MessageSquare,
  Shield,
  School,
  Activity,
  Car,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createConversation } from "../services/api/requests/Conversations";
import {
  indexCaregiverReviews,
  showCaregivers,
} from "../services/api/requests/Caregivers";

export const NannyProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: nanny,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["caregiver", id],
    queryFn: () => showCaregivers(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["caregiverReviews", id],
    queryFn: () => indexCaregiverReviews(id!),
    enabled: !!id,
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    return differenceInYears(new Date(), parseISO(birthDate));
  };

  const createConversationMutation = useMutation({
    mutationFn: () => createConversation(nanny?.userId),
    onSuccess: (data) => {
      navigate(`/messages/${data.id}`);
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-text-muted-light">Carregando Perfil...</div>
    );
  if (isError || !nanny)
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar babá ou perfil não encontrado.
      </div>
    );

  const caregiverAge = calculateAge(nanny?.user?.birthDate);

  const stats = [
    { label: "Experiência", value: `${nanny.experienceYears || 0} anos` },
    { label: "Valor", value: `R$${nanny.hourlyRateCents / 100 || 0}/h` },
    { label: "Resposta", value: nanny.responseRate || "< 1h" },
  ];

  const certifications = [
    { icon: Shield, label: "Certificado CPR" },
    { icon: Activity, label: "Primeiros Socorros" },
    { icon: School, label: "B.A. Educação" },
    { icon: Car, label: "Direção Segura" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 flex-start border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-text-light dark:text-text-dark">Perfil da Babá</h2>
      </header>

      <main>
        <div className="flex p-6 flex-col items-center">
          <div className="relative">
            <div className="size-32 rounded-full border-4 border-border-light dark:border-border-dark overflow-hidden shadow-md">
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
            {nanny.isVerified && (
              <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-1 border-2 border-surface-light dark:border-surface-dark">
                <Verified size={16} />
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
              {nanny?.user?.name}
              {caregiverAge && `, ${caregiverAge}`}
            </h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star size={18} className="text-warning fill-warning" />
              {nanny.ratingCount !== 0 ? (
                <>
                  <span className="font-bold text-text-light dark:text-text-dark">{nanny.ratingAvg}</span>
                  <span className="text-text-muted-light dark:text-text-muted-dark text-sm">
                    ({nanny.ratingCount} avaliações)
                  </span>
                </>
              ) : (
                <span className="text-text-muted-light dark:text-text-muted-dark text-sm">Sem avaliações</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 px-6 py-2 no-scrollbar">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex min-w-[120px] flex-col gap-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
            >
              <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-text-light dark:text-text-dark">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="px-6 py-6">
          <h3 className="text-xl font-bold mb-3 text-text-light dark:text-text-dark">Sobre Mim</h3>
          <p className="text-text-muted-light dark:text-text-muted-dark leading-relaxed">
            {nanny.bio}
          </p>
        </section>

        <section className="px-6 py-6 border-t border-border-light dark:border-border-dark">
          <h3 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">Certificações</h3>
          <div className="grid grid-cols-2 gap-3">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
              >
                <cert.icon size={20} className="text-primary" />
                <span className="text-sm font-semibold text-text-light dark:text-text-dark">{cert.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-6 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Avaliações Recentes</h3>
            <button className="text-primary text-sm font-semibold transition-colors hover:text-primary-hover">
              Ver Todas
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 no-scrollbar">
            {isLoadingReviews && (
              <p className="text-sm text-text-muted-light">Carregando avaliações...</p>
            )}
            {!isLoadingReviews && reviews.length === 0 && (
              <p className="text-sm text-text-muted-light italic">
                Nenhuma avaliação disponível ainda.
              </p>
            )}
            {reviews.map((review: any) => (
              <div
                key={review.id}
                className="min-w-[280px] p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col gap-3"
              >
                <div className="items-center flex gap-3">
                  <div className="size-10 rounded-full bg-border-light overflow-hidden">
                    <img
                      src={
                        review.author?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${review.author?.name || "R"}&background=random`
                      }
                      alt={review.author?.name || "Responsável"}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-light dark:text-text-dark">
                      {review.author?.name || "Responsável"}
                    </p>
                    <div className="flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={cn(
                            i < review.rating
                              ? "fill-current"
                              : "text-border-light dark:text-border-dark",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-border-light dark:border-border-dark flex gap-4 z-20">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => createConversationMutation.mutate()}
          isLoading={createConversationMutation.isPending}
        >
          <MessageSquare size={24} />
        </Button>
        <Button
          className="flex-1 text-lg"
          onClick={() => navigate(`/book/${nanny.id}`)}
        >
          Reservar Agora
        </Button>
      </div>
    </div>
  );
};
