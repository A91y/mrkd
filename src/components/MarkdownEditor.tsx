'use client';

import { useEffect, useRef, useState } from 'react';
import { MarkdownEditorProps } from '@/types';
import { getTextStats, debounce } from '@/lib/utils';
import { STORAGE_KEYS, AUTOSAVE_DELAY } from '@/lib/constants';
import MarkdownPreview from './MarkdownPreview';

export default function MarkdownEditor({
  value,
  onChange,
  onShare,
  isUploading = false,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ characters: 0, words: 0 });
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Update stats when value changes
  useEffect(() => {
    setStats(getTextStats(value));
  }, [value]);

  // Auto-save draft
  useEffect(() => {
    const saveDraft = debounce(() => {
      if (value) {
        localStorage.setItem(STORAGE_KEYS.DRAFT, value);
      }
    }, AUTOSAVE_DELAY);

    saveDraft();
  }, [value]);

  // Handle tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      onChange('');
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    }
  };

  // Handle preview toggle with smooth scroll on mobile
  const handlePreviewToggle = () => {
    const newShowPreview = !showPreview;
    setShowPreview(newShowPreview);

    // On mobile/tablet (below lg breakpoint), scroll to preview and show indicator
    if (newShowPreview && window.innerWidth < 1024) {
      // Show scroll indicator immediately
      setShowScrollIndicator(true);

      // Scroll to preview after a short delay (to allow preview to render)
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Hide indicator after scroll animation completes
        setTimeout(() => {
          setShowScrollIndicator(false);
        }, 2000);
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap glass-strong p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium glass px-3 py-1.5 rounded-full border border-border/50">
            {stats.characters} chars · {stats.words} words
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviewToggle}
            className="px-4 py-2 text-sm font-medium glass hover-glow rounded-xl transition-all border border-border/50"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium glass hover-glow rounded-xl transition-all border border-border/50"
            disabled={isUploading}
          >
            Clear
          </button>
          <button
            onClick={onShare}
            disabled={!value || isUploading}
            className="px-6 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-glow"
          >
            {isUploading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="# Start writing your markdown here...

You can use:
- **Bold** and *italic* text
- Lists and checkboxes
- Code blocks
- Tables
- And much more!

Click 'Share ✨' when you're ready to create a link."
            className="w-full h-[600px] p-6 glass-strong border border-border/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm leading-relaxed transition-all placeholder:text-muted-foreground/50"
            spellCheck="false"
          />
          <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-medium border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Editor
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            ref={previewRef}
            className="relative h-[600px] overflow-auto p-6 glass-strong border border-border/50 rounded-2xl scroll-mt-4 group"
          >
            {/* Scroll Indicator - Only shows on small screens */}
            {showScrollIndicator && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 lg:hidden">
                <div className="relative animate-bounce">
                  {/* Floating badge */}
                  <div className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <span>Preview below</span>
                    <svg
                      className="w-4 h-4 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}

            {/* Preview border glow animation on small screens */}
            <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-1000 lg:hidden ${
              showScrollIndicator
                ? 'opacity-100 ring-2 ring-purple-500/50 ring-offset-2 ring-offset-transparent'
                : 'opacity-0'
            }`}></div>

            <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-medium border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Preview
            </div>

            <MarkdownPreview content={value} />
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-6 glass p-4 rounded-2xl border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          Supports{' '}
          <a
            href="https://github.github.com/gfm/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline transition-all"
          >
            GitHub Flavored Markdown
          </a>
          {' · '}
          Auto-saves locally as you type
          {' · '}
          No signup required
        </p>
      </div>
    </div>
  );
}