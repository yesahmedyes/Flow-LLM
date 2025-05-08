import { SidebarMenu } from "~/app/_components/ui/sidebar";
import { Pencil, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Trash } from "iconsax-react";
import { useChatsStore } from "../stores/chatsStore";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Input } from "./ui/input";

export default function SidebarRecents() {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const { chats, addChats } = useChatsStore();

  const utils = api.useUtils();

  const { id } = useParams();
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = api.chat.getChats.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const [pendingDeletes, setPendingDeletes] = useState(0);

  useEffect(() => {
    if (data?.pages && data.pages.length > 0) {
      const n_pages = data.pages.length;

      const allChats = data.pages[n_pages - 1]?.items ?? [];

      addChats(allChats);
    }
  }, [data, addChats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !isFetchingNextPage &&
          pendingDeletes === 0 // Only allow fetch if no pending deletes
        ) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    const currentRef = sentinelRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, pendingDeletes]);

  const deleteChat = api.chat.deleteChat.useMutation({
    onMutate: async ({ id }) => {
      setPendingDeletes((c) => c + 1);

      const previousChats = chats.find((chat) => chat.id === id);

      removeChatById(id);

      await utils.chat.getChats.cancel();

      return { previousChats };
    },
    onError: (err, variables, context) => {
      toast.error("Failed to delete chat");

      if (context?.previousChats) {
        addChats([context.previousChats]);
      }
    },
    onSettled: async () => {
      await utils.chat.getChats.invalidate();

      setPendingDeletes((c) => Math.max(0, c - 1));
    },
  });

  const removeChatById = useChatsStore((state) => state.removeChatById);

  const handleDeleteChat = (chatId: string) => {
    deleteChat.mutate({ id: chatId });

    if (chatId === id) {
      router.replace("/chat");
    }
  };

  const onSelectChat = (chatId: string) => {
    if (chatId === id) {
      return;
    }

    router.push(`/chat/${chatId}`);
  };

  const [editChatId, setEditChatId] = useState<string | null>(null);
  const [editChatName, setEditChatName] = useState<string>("");

  const updateChatName = useChatsStore((state) => state.updateChatName);

  const updateChatNameMutation = api.chat.updateChatName.useMutation();

  const onEditChat = (chatId: string, name: string) => {
    setEditChatId(chatId);
    setEditChatName(name);
  };

  const handleSaveName = (chatId: string, name: string) => {
    updateChatNameMutation.mutate({ id: chatId, name });

    updateChatName(chatId, name);

    setEditChatId(null);
    setEditChatName("");
  };

  return (
    <SidebarMenu className="gap-1 max-h-[60vh] overflow-y-auto px-2">
      {chats
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map((chat) => {
          const isSelected = id === chat.id;

          return (
            <div
              className={`cursor-pointer text-sm flex flex-row justify-between items-center font-light text-accent-foreground ${
                isSelected ? "bg-accent/50" : "hover:bg-accent/50"
              } rounded-lg`}
              key={chat.id}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
              onClick={() => onSelectChat(chat.id)}
            >
              {editChatId === chat.id ? (
                <div className="flex flex-row items-center justify-between w-full px-3 py-2 gap-3">
                  <Input
                    value={editChatName}
                    autoFocus
                    onChange={(e) => setEditChatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveName(chat.id, editChatName);
                      }
                    }}
                    onBlur={() => setEditChatId(null)}
                  />
                  <div
                    className="font-light py-2 cursor-pointer text-foreground"
                    onClick={() => handleSaveName(chat.id, editChatName)}
                  >
                    Save
                  </div>
                </div>
              ) : (
                <span className="truncate w-full px-4 py-3">{chat.name}</span>
              )}
              {!editChatId && hoveredChatId === chat.id && (
                <>
                  <Pencil
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditChat(chat.id, chat.name);
                    }}
                    size={18}
                    className="stroke-foreground ml-3 mr-3"
                  />
                  <Trash
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    size={18}
                    className="stroke-foreground mr-3"
                  />
                </>
              )}
            </div>
          );
        })}

      {(isLoading || hasNextPage) && (
        <div ref={sentinelRef}>
          <Loader2 className="mt-4 mb-6 mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </SidebarMenu>
  );
}
