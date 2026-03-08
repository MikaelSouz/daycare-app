import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle, Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [name, setName] = useState(user?.name || "");
  const [rate, setRate] = useState(0);
  const [experience, setExperience] = useState(0);
  const [bio, setBio] = useState("");

  const allSpecialties = [
    "Recém-nascidos",
    "Necessidades Especiais",
    "Ajuda no Dever",
    "Educação Infantil",
    "Artes e Artesanato",
  ];

  const { data: nanny, isLoading } = useQuery({
    queryKey: ["caregiver", user?.id],
    queryFn: async () => {
      const res = await api.get(`/api/caregivers/me`);
      return res.data.data;
    },
    enabled: !!user?.id && user.role === "CUIDADORA",
  });

  useEffect(() => {
    if (nanny) {
      setName(nanny.user?.name || user?.name || "");
      setRate((nanny.hourlyRateCents || 0) / 100);
      setExperience(nanny.experienceYears || 0);
      setBio(nanny.bio || "");
      setSpecialties(nanny.specialties || []);
    }
  }, [nanny, user]);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s],
    );
  };

  const updateProfile = async () => {
    try {
      if (user?.role === "CUIDADORA") {
        await api.patch("/api/caregivers/me", {
          hourlyRateCents: Math.round(Number(rate) * 100),
          experienceYears: Number(experience),
          bio,
          specialties,
        });
        queryClient.invalidateQueries({ queryKey: ["caregiver", user?.id] });
      }
      // Consider updating the core user profile here as well if name changed
      navigate(-1);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Erro ao atualizar perfil.");
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-text-muted-light">Carregando Perfil...</div>
    );

  return (
    <div className="relative flex h-auto min-h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark shadow-xl overflow-x-hidden pb-24">
      <header className="sticky top-0 z-10 flex items-center bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-border-light dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center text-text-light dark:text-text-dark">Editar Perfil</h2>
        <div className="size-10 flex items-center justify-end">
          <CheckCircle size={24} className="text-primary" />
        </div>
      </header>

      <div className="flex p-6 flex-col items-center">
        <div className="relative group">
          <div className="size-32 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-md overflow-hidden bg-border-light">
            <img
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.name || "Visitante"}&background=random`
              }
              alt="Perfil"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-surface-light dark:border-background-dark flex items-center justify-center shadow-lg">
            <Camera size={16} className="text-white" />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary-hover text-sm font-bold">
          Alterar Foto
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-light dark:text-text-dark">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-14 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-light dark:text-text-dark">
              Valor Hora (R$)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-14 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-light dark:text-text-dark">
              Experiência (Anos)
            </label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full h-14 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-light dark:text-text-dark">
            Bio/Sobre Mim
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 focus:ring-2 focus:ring-primary/50 text-text-light dark:text-text-dark outline-none"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-text-light dark:text-text-dark">
            Especialidades
          </p>
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((s) => {
              const isSelected = specialties.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-text-light dark:text-text-dark"
                      : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-muted-light dark:text-text-muted-dark",
                  )}
                >
                  {s} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <Button className="w-full gap-2" onClick={updateProfile}>
          <Save size={20} />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};
