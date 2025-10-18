'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MarkdownEditor from '@/components/MarkdownEditor';
import ShareModal from '@/components/ShareModal';
import ThemeToggle from '@/components/ThemeToggle';
import GalaxyBackground from '@/components/GalaxyBackground';
import HomeStructuredData from '@/components/HomeStructuredData';
import { STORAGE_KEYS, MESSAGES } from '@/lib/constants';
import { encryptContent, isCryptoSupported } from '@/lib/crypto';
import type { UploadResponse } from '@/types';

export default function Home() {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState('');
  const [showHero, setShowHero] = useState(true);
  const [editSession, setEditSession] = useState<{ id: string; content: string; editKey: string } | null>(null);

  // Load draft from localStorage or edit session on mount
  useEffect(() => {
    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    
    if (isEditMode) {
      const editSessionData = sessionStorage.getItem('editSession');
      if (editSessionData) {
        const session = JSON.parse(editSessionData);
        setContent(session.content);
        setEditSession(session);
        setShowHero(false);
        // Clear the URL parameter
        window.history.replaceState({}, '', '/');
        return;
      }
    }
    
    // Load draft if no edit session
    const draft = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (draft) {
      setContent(draft);
      setShowHero(false);
    }
  }, []);

  const handleShare = async (encryptionKey?: string, documentName?: string, editKey?: string, expirationDays?: number) => {
    if (!content.trim()) {
      setError('Please enter some content before sharing');
      return;
    }

    // Check crypto support if encryption is requested
    if (encryptionKey && !isCryptoSupported()) {
      setError('Encryption is not supported in your browser');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let contentToUpload = content;
      
      // Encrypt content if key is provided
      if (encryptionKey && encryptionKey.trim()) {
        try {
          contentToUpload = await encryptContent(content, encryptionKey.trim());
        } catch {
          setError('Failed to encrypt content');
          setIsUploading(false);
          return;
        }
      }

      // Check if we're in edit mode
      if (editSession) {
        // Update existing document
        const response = await fetch(`/api/update/${editSession.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: contentToUpload,
            editKey: editSession.editKey,
            isEncrypted: !!encryptionKey?.trim()
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Redirect to view page
          window.location.href = `/view/${editSession.id}`;
          // Clear edit session
          sessionStorage.removeItem('editSession');
        } else {
          setError(data.error || 'Failed to update document');
        }
      } else {
        // Create new document
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            content: contentToUpload,
            isEncrypted: !!encryptionKey?.trim(),
            name: documentName?.trim(),
            editKey: editKey?.trim(),
            expirationDays: expirationDays || 30
          }),
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
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(editSession ? 'Failed to update document' : MESSAGES.UPLOAD_ERROR);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartWriting = () => {
    setShowHero(false);
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <HomeStructuredData />

      <div className="min-h-screen text-foreground relative flex flex-col">
        {/* Galaxy Background */}
        <GalaxyBackground />
      
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.h1 
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              mrkd
            </motion.h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Simple markdown sharing
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      {showHero && !content && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="container mx-auto px-4 py-20 text-center flex-1 flex items-center justify-center"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Share Markdown.
              </h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-muted-foreground">
                No Signup. No BS.
              </h3>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Create beautiful markdown, share instantly. Built for writers, developers, and everyone in between.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleStartWriting}
                className="px-8 py-4 text-lg font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl hover-glow transition-all"
              >
                <span className="flex items-center gap-2">
                  Start Writing
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>

              <a
                href="https://github.com/A91y/mrkd"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 text-lg font-semibold glass-strong rounded-2xl hover-glow transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View Source
                </span>
              </a>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-16 flex flex-wrap gap-3 justify-center"
            >
            {['Password Protection', 'End-to-End Encryption', 'Live Preview', 'Dark Mode', 'GFM Support'].map((feature, index) => (
              <div
                key={feature}
                className="glass px-4 py-2 rounded-full text-sm font-medium border border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {feature}
              </div>
            ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Main content */}
      {(!showHero || content) && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 py-8 flex-1"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 glass-strong border border-red-500/30 rounded-2xl text-red-400"
            >
              {error}
            </motion.div>
          )}

          <MarkdownEditor
            value={content}
            onChange={setContent}
            onShare={handleShare}
            isUploading={isUploading}
          />
        </motion.main>
      )}

      {/* Share modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
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