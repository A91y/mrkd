import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ViewClient from '@/components/ViewClient';
import { validateId, extractMetadata } from '@/lib/utils';
import { fetchFromS3 } from '@/lib/s3';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper function to extract plain text from markdown (first 160 chars)
function extractPlainText(markdown: string): string {
  // Remove markdown syntax
  const plainText = markdown
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/~~(.+?)~~/g, '$1') // Remove strikethrough
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/[-*+]\s+/g, '') // Remove list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  return plainText.substring(0, 180);
}

// Extract first heading or first line as title
function extractTitle(markdown: string): string {
  // Try to find first h1 or h2
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1];

  const h2Match = markdown.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1];

  // Fallback to first non-empty line (max 60 chars)
  const firstLine = markdown.split('\n').find(line => line.trim());
  if (firstLine) {
    const cleanLine = firstLine.replace(/^#{1,6}\s+/, '').trim();
    return cleanLine.substring(0, 60) + (cleanLine.length > 60 ? '...' : '');
  }

  return 'Shared Markdown Document';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  // Validate ID format
  if (!validateId(id)) {
    return {
      title: 'Invalid Document - mrkd',
      description: 'The requested document ID is invalid.',
    };
  }

  try {
    // Fetch content from S3
    const result = await fetchFromS3(id);

    if (!result.success || !result.content) {
      return {
        title: 'Document Not Found - mrkd',
        description: 'The requested markdown document could not be found.',
      };
    }

    // Extract metadata
    const { content: cleanContent, metadata: docMetadata } = extractMetadata(result.content);

    // If encrypted, don't show preview
    if (docMetadata?.is_encrypted) {
      const title = docMetadata?.name || 'Encrypted Document';
      return {
        title: `${title} - mrkd`,
        description: 'This document is encrypted. Enter the password to view its contents.',
        robots: {
          index: false,
          follow: true,
        },
        openGraph: {
          title: `${title} - mrkd`,
          description: 'This document is encrypted. Enter the password to view.',
          type: 'article',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/view/${id}`,
          siteName: 'mrkd',
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(docMetadata?.name || 'Anonymous')}&id=${id}&preview=🔒 This document is encrypted`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} - mrkd`,
          description: 'This document is encrypted. Enter the password to view.',
          images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(docMetadata?.name || 'Anonymous')}&id=${id}&preview=🔒 This document is encrypted`],
        },
      };
    }

    // Extract title and description from content
    const title = docMetadata?.name || extractTitle(cleanContent);
    const description = extractPlainText(cleanContent) || 'View this shared markdown document on mrkd.';
    const author = docMetadata?.name || 'Anonymous';

    return {
      title: `${title} - mrkd`,
      description,
      keywords: ['markdown', 'document', 'share', 'mrkd', 'preview', 'gist'],
      authors: [{ name: author }],
      creator: author,
      publisher: 'mrkd',
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/view/${id}`,
      },
      openGraph: {
        title: `${title} - mrkd`,
        description,
        type: 'article',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/view/${id}`,
        siteName: 'mrkd',
        publishedTime: docMetadata?.created_at,
        authors: [author],
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&id=${id}&preview=${encodeURIComponent(description.substring(0, 150))}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - mrkd`,
        description,
        creator: '@A91y',
        images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&id=${id}&preview=${encodeURIComponent(description.substring(0, 150))}`],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error Loading Document - mrkd',
      description: 'An error occurred while loading this markdown document.',
    };
  }
}

export default async function ViewPage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format
  if (!validateId(id)) {
    notFound();
  }

  // For server-side rendering, we can optionally pre-fetch the content
  // But since we have client-side decryption and other features,
  // we'll pass the id to the client component and let it handle fetching
  return <ViewClient id={id} />;
}
