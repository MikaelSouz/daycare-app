import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Smile,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  indexMessages,
  postMessage,
  showConversation,
  Message,
} from "../services/api/requests/Conversations";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  // Busca os detalhes da conversa
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => showConversation(conversationId!),
    enabled: !!conversationId,
  });

  // Busca as mensagens da conversa
  const { data: messages = [], isLoading: loadingMessages } = useQuery<
    Message[]
  >({
    queryKey: ["messages", conversationId],
    queryFn: () => indexMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5000, // Polling a cada 5 segundos
  });

  // Mutation para enviar mensagem
  const sendMutation = useMutation({
    mutationFn: (content: string) => postMessage(conversationId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
    },
  });

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Identifica o outro participante
  const otherParticipant = conversation?.participants?.find(
    (p) => p.userId !== user?.id,
  );
  const contactName = otherParticipant?.user?.name || "Contato";
  const contactAvatar =
    otherParticipant?.user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${contactName}&background=random`;

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupa mensagens por data
  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  // Ordena mensagens por data (mais antigas primeiro para o chat fluir para baixo)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Gera array de grupos {label, messages}
  const groupedMessages: { label: string; msgs: Message[] }[] = [];
  let currentLabel = "";
  for (const msg of sortedMessages) {
    const label = getDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groupedMessages.push({ label, msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  const isLoading = loadingConversation || loadingMessages;

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden max-w-[430px] mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="size-9 rounded-full overflow-hidden bg-border-light">
              <img
                src={contactAvatar}
                alt={contactName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold leading-tight text-text-light dark:text-text-dark">
                {isLoading ? "Carregando..." : contactName}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success"></span>
                <p className="text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark">
                  Online
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user?.role === "PAI" &&
              otherParticipant?.user?.role === "CUIDADORA" && (
                <button
                  onClick={() => navigate(`/nanny/${otherParticipant.userId}`)}
                  className="p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-full text-text-muted-light dark:text-text-muted-dark"
                  title="Ver Perfil da Babá"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              )}
            {user?.role === "CUIDADORA" && (
              <button
                onClick={() => navigate("/nanny/dashboard")}
                className="p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-full text-text-muted-light dark:text-text-muted-dark"
                title="Voltar ao Painel"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            )}
            <button className="p-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-full text-text-muted-light dark:text-text-muted-dark">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-36">
        {isLoading && (
          <p className="text-center text-text-muted-light dark:text-text-muted-dark py-8 text-sm">
            Carregando mensagens...
          </p>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
              Nenhuma mensagem ainda. Comece a conversa!
            </p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.label} className="space-y-4">
            {/* Label de data */}
            <div className="flex justify-center">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark bg-border-light/50 dark:bg-border-dark/50 rounded-full">
                {group.label}
              </span>
            </div>

            {/* Mensagens do grupo */}
            {group.msgs.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const time = format(parseISO(msg.createdAt), "HH:mm");

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
                    isMe ? "flex-col items-end" : "items-end",
                  )}
                >
                  {!isMe && (
                    <div className="size-8 shrink-0 rounded-full overflow-hidden bg-border-light">
                      <img
                        src={
                          msg.sender?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${msg.sender?.name || "U"}&background=random&size=32`
                        }
                        alt={msg.sender?.name || ""}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        isMe
                          ? "rounded-br-none bg-primary text-white shadow-md"
                          : "rounded-bl-none bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark",
                      )}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] text-text-muted-light dark:text-text-muted-dark",
                        isMe ? "mr-1 text-right" : "ml-1",
                      )}
                    >
                      {time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input de mensagem */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-light dark:bg-background-dark text-text-muted-light dark:text-text-muted-dark">
            <Plus size={20} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              className="w-full rounded-full border-none bg-background-light dark:bg-background-dark px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-text-light dark:text-text-dark outline-none"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">
              <Smile size={20} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMutation.isPending}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg transition-all",
              newMessage.trim()
                ? "bg-primary text-white"
                : "bg-border-light dark:bg-border-dark text-text-muted-light dark:text-text-muted-dark",
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
