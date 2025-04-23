"use client";

import { UserButton } from "@clerk/nextjs";

import { SignedIn } from "@clerk/nextjs";
import ModelSelect from "./modelSelect";
import { SidebarTrigger } from "./ui/sidebar";
import { ThemeButton } from "./themeButton";
import { usePathname } from "next/navigation";

export default function TopBar() {
  // TODO: On Page Load, show top bar more smoothly

  const pathname = usePathname();

  return (
    <SignedIn>
      <div className="fixed flex flex-row items-center justify-between gap-3.5 pl-4 pr-6 pb-0.5 h-14 w-full z-10 bg-background border-b border-border/50">
        <div className="flex flex-row gap-6 items-center">
          <SidebarTrigger />
          {pathname.includes("/chat") && <ModelSelect />}
        </div>
        <div className="flex flex-row gap-4 items-center">
          <ThemeButton />
          <UserButton />
        </div>
      </div>
    </SignedIn>
  );
}
