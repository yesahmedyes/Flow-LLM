"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useChatsStore } from "~/app/stores/chatsStore";
import { api } from "~/trpc/react";
import ChatInterface from "~/app/_components/chatInterface";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/app/_components/ui/skeleton";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();

  const { chats } = useChatsStore((state) => state);

  const storedChat = useMemo(() => chats.find((chat) => chat.id === id), [chats, id]);

  const addChat = useChatsStore((state) => state.addChat);

  const getChatByIdMutation = api.chat.getChatById.useMutation({
    onSuccess: (data) => {
      addChat({
        id: data.id,
        messages: data.messages,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    },
    onError: () => {
      toast.error("Failure to load chat. Redirecting to new chat...");

      router.replace("/chat");
    },
  });

  useEffect(() => {
    if (!storedChat) {
      if (!id || id.length === 0) {
        router.replace("/chat");

        toast.error("Failure to load chat. Redirecting to new chat...");

        return;
      }

      getChatByIdMutation.mutate({ id: id as string });
    }
  }, [id, storedChat]);

  return storedChat ? (
    <ChatInterface id={id as string} initialMessages={storedChat.messages} />
  ) : (
    <div className="flex flex-col place-items-center justify-center h-full">
      <Skeleton className="h-2/3 w-4xl" />
    </div>
  );
}
