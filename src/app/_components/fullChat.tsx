import { type Message } from "ai";

interface FullChatProps {
  messages: Message[];
  isLoading: boolean;
}

export default function FullChat({ messages, isLoading }: FullChatProps) {
  return (
    <div className="w-full max-w-4xl space-y-4 my-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-3xl rounded-lg px-4 py-2 ${
              message.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-white"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-3xl rounded-lg px-4 py-2 bg-neutral-800 text-white">
            <div className="flex space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse"></div>
              <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse delay-75"></div>
              <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
