"use client";

import { nanoid } from "nanoid";
import ChatInterface from "./_components/chatInterface";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useChatsStore } from "~/app/stores/chatsStore";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import CustomLoader from "~/app/_components/customLoader";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { chats } = useChatsStore((state) => state);
  const storedChat = useMemo(() => (id ? chats.find((chat) => chat.id === id) : null), [chats, id]);
  const addChat = useChatsStore((state) => state.addChat);

  const getChatByIdMutation = api.chat.getChatById.useMutation({
    onSuccess: (data) => {
      addChat({
        id: data.id,
        userId: data.userId,
        name: data.name,
        messages: data.messages,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    },
    onError: () => {
      // If it's a specific ID that failed to load, go to new chat
      if (id) {
        router.replace("/chat");
        toast.error("Chat not found. Starting a new chat...");
      }
    },
  });

  useEffect(() => {
    if (id && !storedChat) {
      getChatByIdMutation.mutate({ id: id });
    }
  }, [id, storedChat]);

  const [newId] = useState(nanoid());

  return id ? (
    <>{storedChat ? <ChatInterface id={id} initialMessages={storedChat.messages} /> : <CustomLoader />}</>
  ) : (
    <>{newId ? <ChatInterface id={newId} initialMessages={[]} /> : <CustomLoader />}</>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ChatPageContent />
    </Suspense>
  );
}
