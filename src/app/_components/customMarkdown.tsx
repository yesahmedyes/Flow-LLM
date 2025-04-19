/* eslint-disable @typescript-eslint/no-base-to-string */
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CustomMarkdownProps {
  content: string;
}

export default function CustomMarkdown({ content }: CustomMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? "");
          const codeString = String(children).replace(/\n$/, "");

          const isShortCode = !codeString.includes("\n") && codeString.length < 50;

          if (isShortCode && !match?.[1]) {
            return (
              <span className="px-2 py-1 rounded bg-muted text-white font-normal text-sm w-min">{codeString}</span>
            );
          }

          const CodeBlock = () => {
            const [copied, setCopied] = useState(false);

            const handleCopy = () => {
              void navigator.clipboard.writeText(codeString);

              setCopied(true);

              setTimeout(() => setCopied(false), 2000);
            };

            return (
              <div className="relative group">
                <button
                  className="absolute top-2 cursor-pointer right-2 px-3 py-1.5 rounded bg-background/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

                <SyntaxHighlighter style={vscDarkPlus} language={match?.[1] ?? "python"} PreTag="pre" {...props}>
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          };
          return <CodeBlock />;
        },
        pre({ children }) {
          return <>{children}</>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
