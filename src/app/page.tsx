import { HydrateClient } from "~/trpc/server";
import ChatInterface from "./_components/ChatInterface";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-gray-50">
        <div className="container mx-auto flex h-screen flex-col px-4 py-8">
          <header className="mb-8">
            <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
              OpenRouter <span className="text-blue-600">Chat</span>
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Chat with multiple AI models powered by OpenRouter
            </p>
          </header>

          <div className="flex-grow overflow-hidden">
            <ChatInterface />
          </div>

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>
              Built with OpenRouter API. Get your API key at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                openrouter.ai
              </a>
            </p>
          </footer>
        </div>
      </main>
    </HydrateClient>
  );
}
