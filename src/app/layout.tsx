import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import Provider from "./provider";
import { SidebarProvider, SidebarTrigger } from "./_components/ui/sidebar";
import { AppSidebar } from "./_components/appSidebar";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeButton } from "./_components/themeButton";

export const metadata: Metadata = {
  title: "FlowGPT",
  description: "A chatbot for all your needs",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} tracking-wide leading-loose`} suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <Provider>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />

              <main className="w-full h-screen">
                <SidebarTrigger />

                {children}
              </main>

              <SignedIn>
                <div className="absolute flex flex-row gap-2.5 top-0 right-0 p-4">
                  <ThemeButton />
                  <UserButton />
                </div>
              </SignedIn>
            </SidebarProvider>
          </Provider>

          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
