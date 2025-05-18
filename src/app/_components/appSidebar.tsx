"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  useSidebar,
} from "~/app/_components/ui/sidebar";
import { Plus, File } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Story, Thorchain } from "iconsax-react";
import { nanoid } from "nanoid";
import { useUser } from "@clerk/nextjs";

import Link from "next/link";
import SidebarRecents from "./sidebarRecents";
import { useChatsStore } from "../stores/chatsStore";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const user = useUser();

  return user.isSignedIn ? <CustomSidebar userId={user.user?.id} /> : null;
}

function CustomSidebar({ userId }: { userId: string }) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { addChat } = useChatsStore();

  const router = useRouter();

  const onNewChat = () => {
    const newChatId = nanoid();

    addChat({
      id: newChatId,
      messages: [],
      name: "New chat",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    router.push(`/chat?id=${newChatId}`);
  };

  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const handleSidebarClose = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click was on the trigger button
      const isTriggerClick = (event.target as Element).closest('[data-sidebar="trigger"]');

      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && !isTriggerClick) {
        handleSidebarClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, setOpen, setOpenMobile]);

  return (
    <div ref={sidebarRef}>
      <Sidebar>
        <SidebarHeader className="px-4 pb-6 pt-8">
          <Button variant="outline" className="rounded-full" size="lg" onClick={onNewChat}>
            <div className="flex flex-row items-center justify-center gap-2 font-normal">
              <Plus size={20} /> New Chat
            </div>
          </Button>
        </SidebarHeader>
        <SidebarGroupLabel className="pb-2 px-5 mx-0.5">Recents</SidebarGroupLabel>
        <SidebarContent>
          <SidebarGroup>
            <SidebarRecents />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="pt-5 pb-6">
          <div className="flex flex-col gap-1 pb-1">
            <Link href="/files">
              <Button
                variant="ghost"
                className="justify-start w-full flex flex-row items-center gap-2.5"
                size="lg"
                key="files-button"
                onClick={handleSidebarClose}
              >
                <File className="stroke-muted-foreground scale-110" />
                <span className="text-foreground/80 dark:text-foreground">Files</span>
              </Button>
            </Link>
            <Link href="/memories">
              <Button
                variant="ghost"
                className="justify-start w-full flex flex-row items-center gap-2.5"
                size="lg"
                key="memories-button"
                onClick={handleSidebarClose}
              >
                <Story className="stroke-muted-foreground scale-110" />
                <span className="text-foreground/80 dark:text-foreground">Memories</span>
              </Button>
            </Link>
            <Link href="/models">
              <Button
                variant="ghost"
                className="justify-start w-full flex flex-row items-center gap-2.5"
                size="lg"
                key="models-button"
                onClick={handleSidebarClose}
              >
                <Thorchain className="stroke-muted-foreground scale-110" />
                <span className="text-foreground/80 dark:text-foreground">Models</span>
              </Button>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
