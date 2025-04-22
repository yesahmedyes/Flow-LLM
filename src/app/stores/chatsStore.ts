import type { Message } from "ai";
import { create } from "zustand";
import type { chats } from "~/server/db/schema";

export type Chat = typeof chats.$inferSelect;

interface ChatsStore {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  getChatById: (chatId: string) => Chat | null;
  addChat: (chat: Chat) => void;
  updateChatById: (chatId: string, messages: Message[], userId: string) => void;
  removeChatById: (chatId: string) => void;
  updateChatName: (chatId: string, name: string) => void;
}

export const useChatsStore = create<ChatsStore>((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
  getChatById: (chatId: string): Chat | null => {
    const { chats } = useChatsStore.getState();

    return chats.find((chat) => chat.id === chatId) ?? null;
  },
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChatById: (chatId: string, messages: Message[], userId: string) => {
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
          name: messages[0]?.content ?? "New Chat",
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
      chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, name, updatedAt: new Date() } : chat)),
    }));
  },
}));
