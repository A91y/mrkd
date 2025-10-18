'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MarkdownViewerProps } from '@/types';
import CopyButton from './CopyButton';
import 'highlight.js/styles/github-dark.css';

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action buttons */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shared Markdown</h1>
        <div className="flex items-center gap-3">
          <CopyButton text={content} label="Copy Source" />
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            Create Your Own
          </a>
        </div>
      </div>

      {/* Markdown content */}
      <div className="bg-background border border-muted rounded-lg p-8 shadow-sm">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Add copy button to code blocks
              pre: ({ node, children, ...props }) => {
                return (
                  <div className="relative group">
                    <pre {...props}>{children}</pre>
                  </div>
                );
              },
              // Handle images
              img: ({ node, ...props }) => {
                return (
                  <img
                    {...props}
                    className="rounded-lg shadow-md"
                    loading="lazy"
                    alt={props.alt || 'Image'}
                  />
                );
              },
              // Style tables
              table: ({ node, ...props }) => {
                return (
                  <div className="overflow-x-auto">
                    <table {...props} />
                  </div>
                );
              },
              // Add anchor links to headings
              h1: ({ node, children, ...props }) => {
                const id = String(children).toLowerCase().replace(/\s+/g, '-');
                return (
                  <h1 id={id} {...props}>
                    {children}
                  </h1>
                );
              },
              h2: ({ node, children, ...props }) => {
                const id = String(children).toLowerCase().replace(/\s+/g, '-');
                return (
                  <h2 id={id} {...props}>
                    {children}
                  </h2>
                );
              },
              h3: ({ node, children, ...props }) => {
                const id = String(children).toLowerCase().replace(/\s+/g, '-');
                return (
                  <h3 id={id} {...props}>
                    {children}
                  </h3>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>

      {/* Print-friendly note */}
      <div className="mt-6 text-center text-sm text-muted-foreground print:hidden">
        <button
          onClick={() => window.print()}
          className="hover:text-foreground transition-colors"
        >
          Print this page
        </button>
      </div>
    </div>
  );
}