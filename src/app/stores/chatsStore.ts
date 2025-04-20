import type { UIMessage } from "ai";
import { create } from "zustand";

interface ChatsStore {
  chats: Record<string, UIMessage[]>;
  setChats: (chats: Record<string, UIMessage[]>) => void;
  getChatById: (chatId: string) => UIMessage[];
  updateChatById: (chatId: string, messages: UIMessage[]) => void;
}

export const useChatsStore = create<ChatsStore>((set) => ({
  chats: {},
  setChats: (chats) => set({ chats }),
  getChatById: (chatId: string): UIMessage[] => {
    const { chats } = useChatsStore.getState();

    return chats[chatId] ?? [];
  },
  updateChatById: (chatId, messages) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: messages,
      },
    })),
}));
