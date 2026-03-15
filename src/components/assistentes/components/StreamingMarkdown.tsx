import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlinkingCursor } from "./BlinkingCursor";
import { memo } from "react";

interface StreamingMarkdownProps {
  content: string;
  isStreaming: boolean;
}

export const StreamingMarkdown = memo(({ content, isStreaming }: StreamingMarkdownProps) => {
  return (
    <div className="relative">
      <div className="text-[13px] prose dark:prose-invert prose-sm prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:overflow-x-auto prose-code:text-xs prose-p:my-1.5 prose-headings:my-2 prose-table:w-full prose-table:text-xs prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-td:px-3 prose-td:py-2 prose-td:border-t prose-td:border-border/50 max-w-none [overflow-wrap:anywhere] [word-break:break-word] overflow-x-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content + (isStreaming && content.trim() !== '' ? ' ▍' : '')}
        </ReactMarkdown>
      </div>
    </div>
  );
});

StreamingMarkdown.displayName = 'StreamingMarkdown';
