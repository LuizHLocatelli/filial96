import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { memo } from "react";

interface StreamingMarkdownProps {
  content: string;
  isStreaming: boolean;
}

export const StreamingMarkdown = memo(({ content, isStreaming }: StreamingMarkdownProps) => {
  const displayContent = content + (isStreaming && content.trim() !== '' ? '▍' : '');

  return (
    <div className="relative text-[13px] leading-relaxed">
      <style>{`
        .prose-stream table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.75rem;
          overflow-x: auto;
          display: block;
        }
        .prose-stream thead {
          background: hsl(var(--muted) / 0.5);
        }
        .prose-stream th {
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-weight: 500;
          border-bottom: 1px solid hsl(var(--border));
        }
        .prose-stream td {
          padding: 0.5rem 0.75rem;
          border-top: 1px solid hsl(var(--border) / 0.5);
        }
        .prose-stream tr:hover td {
          background: hsl(var(--muted) / 0.3);
        }
        .prose-stream pre {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          overflow-x: auto;
          margin: 0.75rem 0;
        }
        .prose-stream code {
          font-size: 0.7rem;
          font-family: ui-monospace, monospace;
        }
        .prose-stream :not(pre) > code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.7rem;
        }
        .prose-stream ul, .prose-stream ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .prose-stream li {
          margin: 0.25rem 0;
        }
        .prose-stream p {
          margin: 0.5rem 0;
        }
        .prose-stream h1, .prose-stream h2, .prose-stream h3, .prose-stream h4 {
          margin: 1rem 0 0.5rem 0;
          font-weight: 600;
        }
        .prose-stream h1 { font-size: 1.25rem; }
        .prose-stream h2 { font-size: 1.125rem; }
        .prose-stream h3 { font-size: 1rem; }
        .prose-stream h4 { font-size: 0.875rem; }
        .prose-stream blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: hsl(var(--muted-foreground));
        }
        .prose-stream a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-stream a:hover {
          opacity: 0.8;
        }
        .prose-stream hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1rem 0;
        }
        .prose-stream strong {
          font-weight: 600;
        }
        .streaming-cursor {
          display: inline-block;
          width: 6px;
          height: 1em;
          background: hsl(var(--primary));
          margin-left: 2px;
          border-radius: 2px;
          animation: blink 1s infinite;
          vertical-align: text-bottom;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <div className="prose-stream dark:prose-invert max-w-none overflow-wrap-anywhere word-break-break-word">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {displayContent}
        </ReactMarkdown>
      </div>
    </div>
  );
});

StreamingMarkdown.displayName = 'StreamingMarkdown';
