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
import { MoreVertical, ChevronDown, ChevronUp, Plus, File } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Setting2, Story } from "iconsax-react";
import { useChatsStore } from "../stores/chatsStore";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const [chatsViewMore, setChatsViewMore] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const chatsRecord = useChatsStore((state) => state.chats);
  const chats = useMemo(
    () =>
      Object.entries(chatsRecord).map(([chatId, chat]) => ({
        name: chat[0]?.content ?? "New chat",
        id: chatId,
      })),
    [chatsRecord],
  );

  // Display only 5 chats if viewMore is false, otherwise show all
  const displayedChats = chatsViewMore ? chats : chats.slice(0, 5);
  const hasMoreChats = chats.length > 5;

  // Effect to check for chatId in URL when component mounts or URL changes
  useEffect(() => {
    const url = new URL(window.location.href);

    const chatIdParam = url.searchParams.get("chatId");

    setSelectedChatId(chatIdParam);
  }, []);

  const onSelectChat = (chatId: string) => {
    const url = new URL(window.location.href);

    url.searchParams.set("chatId", chatId);

    window.history.pushState({}, "", url.toString());

    setSelectedChatId(chatId);

    console.log(`Selected chat: ${chatId}, URL updated to: ${url.toString()}`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pb-6 pt-8">
        <Button variant="outline" className="rounded-full" size="lg">
          <div className="flex flex-row items-center justify-center gap-2">
            <Plus size={20} /> New Chat
          </div>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="pb-2.5">Recents</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {displayedChats.map((chat) => {
              const isSelected = selectedChatId === chat.id;

              return (
                <div
                  className={`cursor-pointer text-sm flex flex-row justify-between items-center font-light text-accent-foreground ${
                    isSelected ? "bg-accent/50" : "hover:bg-accent/50"
                  } rounded-lg pl-4 pr-3 py-2.5`}
                  key={chat.id}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <span className="truncate">{chat.name}</span>

                  {hoveredChatId === chat.id && <MoreVertical size={20} className="stroke-foreground ml-2" />}
                </div>
              );
            })}

            {hasMoreChats && (
              <div
                className="cursor-pointer text-sm flex flex-row justify-center items-center font-normal text-muted-foreground hover:text-accent-foreground rounded-full px-4 py-4"
                onClick={() => setChatsViewMore(!chatsViewMore)}
              >
                {chatsViewMore ? (
                  <>
                    <span>View Less</span>
                    <ChevronUp size={16} className="ml-1" />
                  </>
                ) : (
                  <>
                    <span>View More</span>
                    <ChevronDown size={16} className="ml-1" />
                  </>
                )}
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pt-4 pb-6">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="justify-start" size="lg">
            <File className="stroke-muted-foreground" /> Files
          </Button>
          <Button variant="ghost" className="justify-start" size="lg">
            <Story className="stroke-muted-foreground" /> Memories
          </Button>
          <Button variant="ghost" className="justify-start" size="lg">
            <Setting2 className="stroke-muted-foreground" /> Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
