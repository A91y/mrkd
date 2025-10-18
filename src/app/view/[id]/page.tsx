import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeToggle from '@/components/ThemeToggle';
import { validateId } from '@/lib/utils';
import type { FetchResponse } from '@/types';

interface ViewPageProps {
  params: Promise<{ id: string }>;
}

async function getMarkdownContent(id: string): Promise<FetchResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/fetch/${id}`, {
      cache: 'no-store', // Always fetch fresh content
    });

    if (!response.ok) {
      return { success: false, error: 'Content not found' };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching markdown:', error);
    return { success: false, error: 'Failed to fetch content' };
  }
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { id } = await params;

  // Validate ID format
  if (!validateId(id)) {
    notFound();
  }

  // Fetch content
  const result = await getMarkdownContent(id);

  if (!result.success || !result.content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-muted">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold hover:text-accent transition-colors">
              mrkd
            </Link>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Simple markdown sharing
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <MarkdownViewer content={result.content} />
      </main>

      {/* Footer */}
      <footer className="border-t border-muted mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Made with 💖 by{' '}
            <a
              href="https://ayushagr.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Ayush
            </a>
            {' · '}
            <a
              href="https://github.com/A91y/mrkd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              View Source
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ViewPageProps) {
  const { id } = await params;

  return {
    title: `Shared Markdown - ${id} | mrkd`,
    description: 'View shared markdown content',
  };
}
