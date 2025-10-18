'use client';

import { useState, useEffect } from 'react';
import MarkdownEditor from '@/components/MarkdownEditor';
import ShareModal from '@/components/ShareModal';
import ThemeToggle from '@/components/ThemeToggle';
import { STORAGE_KEYS, MESSAGES } from '@/lib/constants';
import type { UploadResponse } from '@/types';

export default function Home() {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState('');

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (draft) {
      setContent(draft);
    }
  }, []);

  const handleShare = async () => {
    if (!content.trim()) {
      setError('Please enter some content before sharing');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data: UploadResponse = await response.json();

      if (data.success && data.url) {
        setShareUrl(data.url);
        setShowShareModal(true);
        // Clear draft after successful share
        localStorage.removeItem(STORAGE_KEYS.DRAFT);
      } else {
        setError(data.error || MESSAGES.UPLOAD_ERROR);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(MESSAGES.UPLOAD_ERROR);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-muted">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">mrkd</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Simple markdown sharing
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <MarkdownEditor
          value={content}
          onChange={setContent}
          onShare={handleShare}
          isUploading={isUploading}
        />
      </main>

      {/* Share modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />

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