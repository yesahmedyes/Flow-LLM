import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/app/_components/ui/sonner";

import Provider from "./provider";
import { SidebarProvider } from "./_components/ui/sidebar";
import { AppSidebar } from "./_components/appSidebar";
import { ClerkProvider } from "@clerk/nextjs";
import TopBar from "./_components/topBar";

export const metadata: Metadata = {
  title: "FlowLLM",
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
            {/* Mobile version not available message */}
            <div className="lg:hidden flex items-center justify-center h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 p-6 text-center">
              <div className="max-w-sm">
                <h2 className="text-neutral-800 font-bold mb-3">Mobile Version Coming Soon!</h2>
                <p className="text-neutral-600 text-sm mb-2 leading-loose">
                  For the best experience, please access this application on a desktop device.
                </p>
              </div>
            </div>

            {/* Desktop version */}
            <div className="hidden lg:block">
              <SidebarProvider defaultOpen={false}>
                <AppSidebar />

                <main className="w-full h-screen">
                  <TopBar />

                  {children}
                </main>
              </SidebarProvider>
            </div>
          </Provider>

          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
