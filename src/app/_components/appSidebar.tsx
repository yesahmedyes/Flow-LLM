"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarGroupLabel,
} from "~/app/_components/ui/sidebar";
import { ChevronDown, Plus, File, Loader2, Pencil, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Setting2, Story, Trash } from "iconsax-react";
import { useChatsStore } from "../stores/chatsStore";
import { useParams, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Input } from "./ui/input";

export function AppSidebar() {
  const user = useUser();

  return user.isSignedIn ? <CustomSidebar userId={user.user?.id} /> : null;
}

function CustomSidebar({ userId }: { userId: string }) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const chats = useChatsStore((state) => state.chats);
  const setChats = useChatsStore((state) => state.setChats);
  const addChat = useChatsStore((state) => state.addChat);

  const { id } = useParams();
  const router = useRouter();

  const BATCH_SIZE = 10;

  const { data: chatData } = api.chat.fetchInitialChats.useQuery(undefined, {
    enabled: chats.length === 0,
  });

  useEffect(() => {
    if (chatData) {
      setChats(chatData.items);
      setCursor(chatData.nextCursor ?? 0);
      setHasMore(chatData.nextCursor !== null);
    }
  }, [chatData, setChats]);

  const fetchChats = api.chat.fetchMoreChats.useMutation();

  const loadMoreChats = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    try {
      const result = await fetchChats.mutateAsync({
        limit: BATCH_SIZE,
        cursor,
      });

      if (result.items.length > 0) {
        setChats([...chats, ...result.items]);
      }

      setCursor(result.nextCursor ?? cursor);
      setHasMore(result.nextCursor !== null);
    } catch (error) {
      console.error("Failed to fetch more chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chats, cursor, hasMore, isLoading, fetchChats, setChats]);

  useEffect(() => {
    if (!initialLoadDone) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          void loadMoreChats();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, [initialLoadDone, loadMoreChats]);

  const handleLoadMore = () => {
    void loadMoreChats();

    setInitialLoadDone(true);
  };

  const deleteChat = api.chat.deleteChat.useMutation();

  const removeChatById = useChatsStore((state) => state.removeChatById);

  const handleDeleteChat = (chatId: string) => {
    void deleteChat.mutate(
      { id: chatId },
      {
        onSuccess: () => {
          toast.success("Chat deleted successfully");
        },
      },
    );

    removeChatById(chatId);

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

  const onNewChat = () => {
    const newChatId = nanoid();

    addChat({
      id: newChatId,
      messages: [],
      name: "New Chat",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    router.push(`/chat/${newChatId}`);
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
    <Sidebar>
      <SidebarHeader className="px-4 pb-6 pt-8">
        <Button variant="outline" className="rounded-full" size="lg" onClick={onNewChat}>
          <div className="flex flex-row items-center justify-center gap-2">
            <Plus size={20} /> New Chat
          </div>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="pb-2.5">Recents</SidebarGroupLabel>
          <SidebarMenu className="gap-1 max-h-[60vh] overflow-y-auto">
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
                          onClick={() => setEditChatId(null)}
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

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex justify-center items-center py-2 text-muted-foreground cursor-pointer hover:bg-accent/30 rounded-md"
                onClick={initialLoadDone ? undefined : handleLoadMore}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown size={16} />}
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pt-4 pb-6">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="justify-start" size="lg" key="files-button">
            <File className="stroke-muted-foreground" /> Files
          </Button>
          <Button variant="ghost" className="justify-start" size="lg" key="memories-button">
            <Story className="stroke-muted-foreground" /> Memories
          </Button>
          <Button variant="ghost" className="justify-start" size="lg" key="settings-button">
            <Setting2 className="stroke-muted-foreground" /> Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
