'use client';

import Link from 'next/link';
import Image from 'next/image';
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
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            Create Your Own
          </Link>
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
              pre: ({ children, ...props }) => {
                return (
                  <div className="relative group">
                    <pre {...props}>{children}</pre>
                  </div>
                );
              },
              // Handle images with Next.js Image component
              img: ({ src, alt, ...props }) => {
                if (!src) return null;
                // For external images, use regular img tag
                if (typeof src === 'string' && src.startsWith('http')) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={alt || 'Image'}
                      {...props}
                      className="rounded-lg shadow-md"
                      loading="lazy"
                    />
                  );
                }
                // For local images, use Next.js Image (only if src is a string)
                if (typeof src === 'string') {
                  return (
                    <Image
                      src={src}
                      alt={alt || 'Image'}
                      width={800}
                      height={600}
                      className="rounded-lg shadow-md"
                    />
                  );
                }
                // Fallback for non-string src
                return null;
              },
              // Style tables
              table: ({ children, ...props }) => {
                return (
                  <div className="overflow-x-auto">
                    <table {...props}>{children}</table>
                  </div>
                );
              },
              // Add anchor links to headings
              h1: ({ children, ...props }) => {
                const id = String(children).toLowerCase().replace(/\s+/g, '-');
                return (
                  <h1 id={id} {...props}>
                    {children}
                  </h1>
                );
              },
              h2: ({ children, ...props }) => {
                const id = String(children).toLowerCase().replace(/\s+/g, '-');
                return (
                  <h2 id={id} {...props}>
                    {children}
                  </h2>
                );
              },
              h3: ({ children, ...props }) => {
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