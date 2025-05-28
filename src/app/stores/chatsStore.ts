import type { UIMessage } from "ai";
import { create } from "zustand";
import type { chats } from "~/server/db/schema";

export type Chat = typeof chats.$inferSelect;

interface ChatsStore {
  chats: Chat[];
  addChats: (chats: Chat[]) => void;
  getChatById: (chatId: string) => Chat | null;
  addChat: (chat: Chat) => void;
  updateChatById: (chatId: string, messages: UIMessage[], userId: string) => void;
  removeChatById: (chatId: string) => void;
  updateChatName: (chatId: string, name: string) => void;
}

export const useChatsStore = create<ChatsStore>((set) => ({
  chats: [],
  addChats: (chats) =>
    set((state) => {
      const existingChatIds = new Set(state.chats.map((chat) => chat.id));

      const newChats = chats.filter((chat) => !existingChatIds.has(chat.id));

      return { chats: [...state.chats, ...newChats] };
    }),
  getChatById: (chatId: string): Chat | null => {
    const { chats } = useChatsStore.getState();

    return chats.find((chat) => chat.id === chatId) ?? null;
  },
  addChat: (chat) =>
    set((state) => {
      const chatExists = state.chats.some((c) => c.id === chat.id);

      if (chatExists) {
        return {
          chats: state.chats.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)),
        };
      }

      return { chats: [...state.chats, chat] };
    }),
  updateChatById: (chatId: string, messages: UIMessage[], userId: string) => {
    set((state) => {
      const chatExists = state.chats.some((c) => c.id === chatId);

      if (chatExists) {
        return {
          chats: state.chats.map((c) => (c.id === chatId ? { ...c, messages, updatedAt: new Date() } : c)),
        };
      } else {
        // Create a new chat if it doesn't exist yet
        const newChat: Chat = {
          id: chatId,
          messages,
          userId,
          name: messages[0]?.content && messages[0]?.content.length > 0 ? messages[0]?.content : "New Chat",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          chats: [...state.chats, newChat],
        };
      }
    });
  },
  removeChatById: (chatId: string) => {
    set((state) => ({ chats: state.chats.filter((chat) => chat.id !== chatId) }));
  },
  updateChatName: (chatId: string, name: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, name } : chat)),
    }));
  },
}));
