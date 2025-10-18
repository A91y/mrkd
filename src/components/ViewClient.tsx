'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownViewer from '@/components/MarkdownViewer';
import ThemeToggle from '@/components/ThemeToggle';
import GalaxyBackground from '@/components/GalaxyBackground';
import DecryptModal from '@/components/DecryptModal';
import EditModal from '@/components/EditModal';
import StructuredData from '@/components/StructuredData';
import { decryptContent } from '@/lib/crypto';
import type { FetchResponse } from '@/types';

interface ViewClientProps {
  id: string;
  initialContent?: string;
  initialMetadata?: FetchResponse['metadata'];
  initialError?: string;
}

export default function ViewClient({ id, initialContent, initialMetadata, initialError }: ViewClientProps) {
  const router = useRouter();

  const [content, setContent] = useState<string>(initialContent || '');
  const [metadata, setMetadata] = useState<FetchResponse['metadata']>(initialMetadata);
  const [isLoading, setIsLoading] = useState(!initialContent && !initialError);
  const [error, setError] = useState<string>(initialError || '');
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [encryptedContent, setEncryptedContent] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState<string>('');

  useEffect(() => {
    // If we have initial data and it's encrypted, show decrypt modal
    if (initialContent && initialMetadata?.isEncrypted) {
      setEncryptedContent(initialContent);
      setShowDecryptModal(true);
      setIsLoading(false);
    }

    // If no initial data provided, fetch it
    if (!initialContent && !initialError) {
      async function fetchContent() {
        try {
          const response = await fetch(`/api/fetch/${id}`);

          if (!response.ok) {
            setError('Content not found');
            setIsLoading(false);
            return;
          }

          const result: FetchResponse = await response.json();

          if (!result.success || !result.content) {
            setError('Failed to load content');
            setIsLoading(false);
            return;
          }

          setMetadata(result.metadata);

          // Check if content is encrypted
          if (result.metadata?.isEncrypted) {
            setEncryptedContent(result.content);
            setShowDecryptModal(true);
            setIsLoading(false);
          } else {
            setContent(result.content);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Error fetching markdown:', err);
          setError('Failed to load content');
          setIsLoading(false);
        }
      }

      fetchContent();
    }
  }, [id, initialContent, initialError, initialMetadata]);

  const handleDecrypt = async (password: string) => {
    try {
      setDecryptError('');
      const decrypted = await decryptContent(encryptedContent, password);
      setContent(decrypted);
      setShowDecryptModal(false);
    } catch (err) {
      console.error('Decryption error:', err);
      setDecryptError('Failed to decrypt. Wrong password?');
    }
  };

  const handleCancelDecrypt = () => {
    router.push('/');
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleConfirmEdit = async (editKey: string) => {
    try {
      setEditError('');

      // Verify edit key by hashing and checking with backend
      const response = await fetch(`/api/verify-edit-key/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editKey }),
      });

      const result = await response.json();

      if (result.success) {
        // Store edit session info
        sessionStorage.setItem('editSession', JSON.stringify({
          id,
          content,
          editKey,
          name: metadata?.name,
          isEncrypted: metadata?.isEncrypted
        }));

        // Redirect to home page in edit mode
        router.push('/?edit=true');
      } else {
        setEditError(result.error || 'Invalid edit key');
      }
    } catch (err) {
      console.error('Edit verification error:', err);
      setEditError('Failed to verify edit key');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">{error}</p>
          <Link href="/" className="text-accent hover:underline mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Helper to extract title and description for structured data
  const extractTitle = (content: string): string => {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1];
    const firstLine = content.split('\n').find(line => line.trim());
    return firstLine?.substring(0, 60) || 'Shared Markdown Document';
  };

  const extractDescription = (content: string): string => {
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .trim();
    return plainText.substring(0, 160);
  };

  const title = metadata?.name || extractTitle(content);
  const description = extractDescription(content);
  const author = metadata?.name || 'Anonymous';

  return (
    <>
      {/* Structured Data for SEO */}
      {content && !metadata?.isEncrypted && (
        <StructuredData
          id={id}
          title={title}
          description={description}
          author={author}
          datePublished={metadata?.createdAt}
          isEncrypted={false}
        />
      )}

      <div className="min-h-screen text-foreground relative flex flex-col">
        {/* Galaxy Background */}
        <GalaxyBackground />

        {/* Header */}
        <header className="glass border-b border-border/50 sticky top-0 z-30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-foreground hover:text-accent transition-colors">
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
      <main className="container mx-auto px-4 py-8 flex-1">
        <MarkdownViewer
          content={content}
          metadata={{
            name: metadata?.name,
            isEditable: metadata?.isEditable,
            version: metadata?.version
          }}
          onEdit={handleEdit}
        />
      </main>

      {/* Decrypt Modal */}
      <DecryptModal
        isOpen={showDecryptModal}
        onDecrypt={handleDecrypt}
        onCancel={handleCancelDecrypt}
        error={decryptError}
      />

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
        error={editError}
      />

      {/* Footer */}
      <footer className="glass border-t border-border/50 mt-16 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Made with 💖 by{' '}
            <a
              href="https://ayushagr.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline transition-all"
            >
              Ayush
            </a>
            {' · '}
            <a
              href="https://github.com/A91y/mrkd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline transition-all"
            >
              View Source
            </a>
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
