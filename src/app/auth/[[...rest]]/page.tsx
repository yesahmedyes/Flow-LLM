"use client";

import { SignIn } from "@clerk/nextjs";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  // TODO: Redirect to home page after sign in

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const texts = [
      "Access to all the models in one place",
      "Guardrails to keep your data secure",
      "Prebuilt agents for complex workflows",
    ];

    let timeout: NodeJS.Timeout | undefined;

    if (isTyping) {
      if (displayText.length < texts[currentTextIndex]!.length) {
        timeout = setTimeout(() => {
          setDisplayText(texts[currentTextIndex]!.substring(0, displayText.length + 1));
        }, 20);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 5000);
      }
    } else if (!isTyping) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 20);
      } else {
        setCurrentTextIndex((currentTextIndex + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentTextIndex, displayText, isTyping]);

  const searchParams = useSearchParams();

  const showSignUp = searchParams.get("signup") === "true";
  const showSignIn = searchParams.get("signin") === "true";

  return (
    <div className="flex flex-1 flex-col md:flex-row h-screen">
      {/* Left side with prompt area */}
      <div className="flex flex-1 flex-col justify-center p-8 bg-[#0f0a1f]">
        <h1 className="absolute top-0 left-0 px-8 py-6 text-2xl place-self-start font-bold text-purple-400">FlowLLM</h1>

        <div className="w-full pb-16 text-center">
          <h2 className="text-xl font-bold text-purple-400 mb-4">{displayText}</h2>
        </div>
      </div>

      {/* Right side with auth buttons */}

      <div className="flex-1 flex flex-col items-center justify-center bg-black relative pb-12">
        {showSignUp ? (
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
                card: "bg-background border shadow-sm",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formFieldLabel: "text-foreground",
                socialButtonsBlockButton: "border hover:bg-accent",
                footer: "text-muted-foreground",
              },
            }}
            routing="hash"
            signInUrl="/auth?signin=true"
          />
        ) : showSignIn ? (
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
                card: "bg-background border shadow-sm",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formFieldLabel: "text-foreground",
                socialButtonsBlockButton: "border hover:bg-accent",
                footer: "text-muted-foreground",
              },
            }}
            routing="hash"
            signUpUrl="/auth?signup=true"
          />
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-8">Get started</h2>

            <div className="w-full flex flex-row gap-4 place-self-center justify-center pb-8">
              <Link
                href="/auth?signin=true"
                className="w-min bg-blue-600 hover:bg-blue-800 rounded-full px-20 py-2 whitespace-nowrap text-center"
              >
                Log in
              </Link>

              <Link
                href="/auth?signup=true"
                className="w-min bg-blue-600 hover:bg-blue-800 rounded-full px-20 py-2 whitespace-nowrap text-center"
              >
                Sign up
              </Link>
            </div>

            {/* Bottom logo and links */}
            <div className="mt-32 absolute bottom-12 flex flex-row gap-3 items-center justify-center text-xs text-gray-500">
              <Link href="#" className="cursor-pointer hover:text-gray-300">
                Terms of use
              </Link>
              <span>|</span>
              <Link href="#" className="cursor-pointer hover:text-gray-300">
                Privacy policy
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
