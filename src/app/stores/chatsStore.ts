import type { Message } from "ai";
import { create } from "zustand";
import type { chats } from "~/server/db/schema";

export type Chat = typeof chats.$inferSelect;

interface ChatsStore {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  getChatById: (chatId: string) => Chat | null;
  addChat: (chat: Chat) => void;
  updateChatById: (chatId: string, messages: Message[]) => void;
}

export const useChatsStore = create<ChatsStore>((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),

  getChatById: (chatId: string): Chat | null => {
    const { chats } = useChatsStore.getState();

    return chats.find((chat) => chat.id === chatId) ?? null;
  },
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChatById: (chatId: string, messages: Message[]) => {
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chatId ? { ...c, messages } : c)),
    }));
  },
}));
