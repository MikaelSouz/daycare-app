import { api } from "../..";

// Interfaces
export interface Conversation {
  id: string;
  isDirect: boolean;
  lastMessageAt: string | null;
  lastMessageText: string | null;
  participants: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      role: string;
    };
  }[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

// Listar todas as conversas do usuário logado
export const indexConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/api/conversations");
  return response.data.data?.items || response.data.data || [];
};

// Buscar detalhes de uma conversa específica
export const showConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get(`/api/conversations/${id}`);
  return response.data.data;
};

// Listar mensagens de uma conversa
export const indexMessages = async (
  conversationId: string,
): Promise<Message[]> => {
  const response = await api.get(
    `/api/conversations/${conversationId}/messages`,
  );
  return response.data.data?.items || response.data.data || [];
};

// Enviar uma mensagem em uma conversa
export const postMessage = async (
  conversationId: string,
  content: string,
): Promise<Message> => {
  const response = await api.post(
    `/api/conversations/${conversationId}/messages`,
    { content },
  );
  return response.data.data;
};

// Criar uma nova conversa (direta)
export const createConversation = async (
  caregiverId: string,
): Promise<Conversation> => {
  const response = await api.post("/api/conversations/direct", {
    caregiverId,
  });
  return response.data.data;
};
