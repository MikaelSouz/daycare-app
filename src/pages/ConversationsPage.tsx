import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  indexConversations,
  Conversation,
} from "../services/api/requests/Conversations";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ConversationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: indexConversations,
  });

  // Ordena por última mensagem (mais recente primeiro)
  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return dateB - dateA;
  });

  // Encontra o outro participante da conversa
  const getOtherParticipant = (conversation: Conversation) => {
    const other = conversation.participants?.find(
      (p) => p.userId !== user?.id,
    );
    return other?.user || { name: "Contato", avatarUrl: null, role: "" };
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-border-light dark:hover:bg-border-dark rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Mensagens</h1>
          <div className="size-10" />
        </div>
      </header>

      {/* Lista de Conversas */}
      <main className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="text-center text-text-muted-light py-12">
            Carregando conversas...
          </p>
        )}

        {isError && (
          <div className="flex flex-col items-center py-16 gap-3">
            <MessageSquare
              size={48}
              className="text-text-muted-light/30 dark:text-text-muted-dark/30"
            />
            <p className="text-text-muted-light text-sm">
              Erro ao carregar conversas.
            </p>
          </div>
        )}

        {!isLoading && !isError && sortedConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-20 rounded-full bg-border-light dark:bg-border-dark flex items-center justify-center">
              <MessageSquare
                size={36}
                className="text-text-muted-light dark:text-text-muted-dark"
              />
            </div>
            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
              Nenhuma conversa ainda
            </h3>
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm text-center px-8">
              As conversas aparecerão aqui quando você interagir com
              responsáveis ou cuidadoras.
            </p>
          </div>
        )}

        {sortedConversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const avatarUrl =
            otherUser.avatarUrl ||
            `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`;

          const timeAgo = conversation.lastMessageAt
            ? formatDistanceToNow(parseISO(conversation.lastMessageAt), {
                addSuffix: true,
                locale: ptBR,
              })
            : "";

          return (
            <button
              key={conversation.id}
              onClick={() => navigate(`/messages/${conversation.id}`)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-background-light dark:hover:bg-border-dark/50 transition-colors border-b border-border-light dark:border-border-dark/50 text-left"
            >
              {/* Avatar */}
              <div className="size-14 shrink-0 rounded-full overflow-hidden bg-border-light dark:bg-border-dark">
                <img
                  src={avatarUrl}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold truncate text-text-light dark:text-text-dark">
                    {otherUser.name}
                  </h3>
                  <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-medium shrink-0 ml-2">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark truncate mt-0.5">
                  {conversation.lastMessageText || "Nenhuma mensagem ainda"}
                </p>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
};
