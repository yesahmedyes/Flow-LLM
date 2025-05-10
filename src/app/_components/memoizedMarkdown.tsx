import { useState } from "react";
import { marked, type Token } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

function preprocessMath(markdown: string): string {
  let processed = markdown.replace(/\\\(/g, "$").replace(/\\\)/g, "$");

  processed = processed.replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");

  return processed;
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const processed = preprocessMath(markdown);

  const tokens = marked.lexer(processed) as Token[];

  return tokens.map((token: Token) => token.raw);
}

function CodeBlock({ codeString, language }: { codeString: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(codeString);

    setCopied(true);

    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="relative group">
      <button
        className="absolute top-2 cursor-pointer right-2 px-3 py-1.5 rounded bg-background/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <SyntaxHighlighter style={vscDarkPlus} language={language} PreTag="pre">
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? "");
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const codeString = String(children).replace(/\n$/, "");

          const language = match?.[1] ?? "python";

          const isShortCode = !codeString.includes("\n") && codeString.length < 50;

          if (isShortCode && !match?.[1]) {
            return (
              <span className="px-2 py-1 rounded bg-muted text-foreground/80 font-normal text-sm w-min">
                {codeString}
              </span>
            );
          }

          return <CodeBlock codeString={codeString} language={language} />;
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

const MemoizedMarkdownBlock = memo(MarkdownBlock, (prevProps, nextProps) => prevProps.content === nextProps.content);

interface MemoizedMarkdownProps {
  content: string;
  id: string;
}

export default function MemoizedMarkdown({ content, id }: MemoizedMarkdownProps) {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

  return (
    <>
      {blocks.map((block, index) => {
        return <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />;
      })}
    </>
  );
}
