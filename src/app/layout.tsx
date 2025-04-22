import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import Provider from "./provider";
import { SidebarProvider, SidebarTrigger } from "./_components/ui/sidebar";
import { AppSidebar } from "./_components/appSidebar";
import { useUser } from "@clerk/nextjs";

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
        <Provider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />

            <main className="w-full h-screen">
              <SidebarTrigger />

              {children}
            </main>
          </SidebarProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
