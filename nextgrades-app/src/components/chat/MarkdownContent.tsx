"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words",
        isDark ? "prose-invert" : "",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-sm",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
