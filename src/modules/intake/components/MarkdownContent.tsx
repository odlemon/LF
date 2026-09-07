"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className={`lysp-md text-[14px] leading-[1.65] text-ink/90 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold tracking-tight text-ink mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-semibold tracking-tight text-ink mt-4 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-ink mt-3 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-ink/80">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 pl-4 list-disc marker:text-ink/35">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-2 pl-5 list-decimal marker:font-semibold marker:text-ink/45">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-0.5 text-ink/85 [&>p]:mb-1 [&>p]:last:mb-0">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 decoration-ink/25 hover:decoration-ink/60"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-ink/15 pl-3 text-ink/60 italic">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <code className="block text-[12px] font-mono leading-relaxed text-ink/80 whitespace-pre">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-field px-1.5 py-0.5 text-[12px] font-mono text-ink/80">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-xl border border-border bg-field/80 p-3 rates-scrollable">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-4 border-border" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border rates-scrollable">
              <table className="w-full min-w-[420px] border-collapse text-left text-[12.5px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-field/80 text-ink/55">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="bg-surface">{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 font-semibold whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2.5 align-top text-ink/80">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
