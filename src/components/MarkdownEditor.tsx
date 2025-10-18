"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MarkdownEditorProps } from "@/types";
import { getTextStats, debounce } from "@/lib/utils";
import { STORAGE_KEYS, AUTOSAVE_DELAY } from "@/lib/constants";
import MarkdownPreview from "./MarkdownPreview";

export default function MarkdownEditor({
  value,
  onChange,
  onShare,
  isUploading = false,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ characters: 0, words: 0 });
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [editKey, setEditKey] = useState("");
  const [expirationDays, setExpirationDays] = useState(30);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExpirationOpen, setIsExpirationOpen] = useState(false);
  const expirationDropdownRef = useRef<HTMLDivElement>(null);
  const expirationOptions = [
    { label: "1 Day", value: 1 },
    { label: "7 Days", value: 7 },
    { label: "30 Days (Default)", value: 30 },
    { label: "90 Days", value: 90 },
    { label: "1 Year", value: 365 },
    { label: "Never", value: -1 },
  ];

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
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the editor?")) {
      onChange("");
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    }
  };

  // Handle preview toggle with smooth scroll on mobile
  const handlePreviewToggle = useCallback(() => {
    const newShowPreview = !showPreview;
    setShowPreview(newShowPreview);

    // On mobile/tablet (below lg breakpoint), scroll to preview and show indicator
    if (newShowPreview && window.innerWidth < 1024) {
      // Show scroll indicator immediately
      setShowScrollIndicator(true);

      // Scroll to preview after a short delay (to allow preview to render)
      setTimeout(() => {
        previewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Hide indicator after scroll animation completes
        setTimeout(() => {
          setShowScrollIndicator(false);
        }, 2000);
      }, 100);
    }
  }, [showPreview]);

  const handleShareClick = useCallback(() => {
    onShare(
      encryptionKey || undefined,
      documentName || undefined,
      editKey || undefined,
      expirationDays
    );
  }, [onShare, encryptionKey, documentName, editKey, expirationDays]);

  const insertFormatting = useCallback(
    (before: string, after: string, placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || placeholder;
      const newValue =
        value.substring(0, start) +
        before +
        textToInsert +
        after +
        value.substring(end);

      onChange(newValue);

      // Set cursor position
      setTimeout(() => {
        if (selectedText) {
          textarea.selectionStart = start + before.length;
          textarea.selectionEnd = start + before.length + selectedText.length;
        } else {
          textarea.selectionStart = start + before.length;
          textarea.selectionEnd = start + before.length + placeholder.length;
        }
        textarea.focus();
      }, 0);
    },
    [value, onChange]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + S: Share
      if (modKey && e.key === "s") {
        e.preventDefault();
        if (value && !isUploading) {
          handleShareClick();
        }
      }

      // Cmd/Ctrl + P: Toggle Preview
      if (modKey && e.key === "p") {
        e.preventDefault();
        handlePreviewToggle();
      }

      // Cmd/Ctrl + B: Bold (when textarea is focused)
      if (
        modKey &&
        e.key === "b" &&
        document.activeElement === textareaRef.current
      ) {
        e.preventDefault();
        insertFormatting("**", "**", "bold text");
      }

      // Cmd/Ctrl + I: Italic (when textarea is focused)
      if (
        modKey &&
        e.key === "i" &&
        document.activeElement === textareaRef.current
      ) {
        e.preventDefault();
        insertFormatting("*", "*", "italic text");
      }

      // Cmd/Ctrl + K: Link (when textarea is focused)
      if (
        modKey &&
        e.key === "k" &&
        document.activeElement === textareaRef.current
      ) {
        e.preventDefault();
        insertFormatting("[", "](url)", "link text");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    value,
    isUploading,
    showPreview,
    handlePreviewToggle,
    handleShareClick,
    insertFormatting,
  ]);

  // Close expiration dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isExpirationOpen &&
        expirationDropdownRef.current &&
        !expirationDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExpirationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpirationOpen]);

  // Close on Escape
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpirationOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

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
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
            className={`px-4 py-2 text-sm font-medium glass hover-glow rounded-xl transition-all border border-border/50 ${
              showAdditionalInfo ? "ring-2 ring-accent/50" : ""
            }`}
            title="Document name and edit key"
          >
            ⚙️
          </button>
          <button
            onClick={() => setShowEncryption(!showEncryption)}
            className={`px-4 py-2 text-sm font-medium glass hover-glow rounded-xl transition-all border border-border/50 ${
              showEncryption ? "ring-2 ring-accent/50" : ""
            }`}
            title="Encrypt with password"
          >
            🔒
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium glass hover-glow rounded-xl transition-all border border-border/50"
            disabled={isUploading}
          >
            Clear
          </button>
          <button
            onClick={handleShareClick}
            disabled={!value || isUploading}
            className="px-6 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover-glow"
          >
            {isUploading ? "Sharing..." : "Share ✨"}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      {showAdditionalInfo && (
        <div className="mb-6 glass-strong p-4 rounded-2xl border border-border/50 space-y-4 relative z-30">
          <div>
            <label className="block text-sm font-medium mb-2">
              📝 Document Name (Optional)
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="My awesome markdown document"
              className="w-full px-4 py-2 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Give your document a name for easy identification
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              🔑 Edit Key (Optional)
            </label>
            <input
              type="password"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              placeholder="Enter a key to enable editing later"
              className="w-full px-4 py-2 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Set an edit key to update this document later. Keep it safe!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ⏰ Expiration
            </label>
            <div className="relative" ref={expirationDropdownRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isExpirationOpen}
                onClick={() => setIsExpirationOpen((v) => !v)}
                className="w-full px-4 py-2 pr-10 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-foreground flex items-center justify-between"
              >
                <span>
                  {expirationOptions.find((o) => o.value === expirationDays)
                    ?.label || "Select"}
                </span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    isExpirationOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpirationOpen && (
                <div
                  role="listbox"
                  className="absolute mt-2 w-full z-50 bg-background border border-border/50 rounded-xl shadow-lg overflow-hidden"
                >
                  <ul className="max-h-60 overflow-auto py-1">
                    {expirationOptions.map((opt) => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={expirationDays === opt.value}
                        onClick={() => {
                          setExpirationDays(opt.value);
                          setIsExpirationOpen(false);
                        }}
                        className={`px-4 py-2 cursor-pointer transition-all ${
                          expirationDays === opt.value
                            ? "bg-accent/10 border-l-2 border-accent"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Encryption Input */}
      {showEncryption && (
        <div className="mb-6 glass-strong p-4 rounded-2xl border border-border/50">
          <label className="block text-sm font-medium mb-2">
            🔒 Encryption Password (Optional)
          </label>
          <input
            type="password"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            placeholder="Enter password to encrypt your markdown"
            className="w-full px-4 py-2 glass border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Your content will be encrypted in your browser. Keep this password
            safe - it cannot be recovered!
          </p>
        </div>
      )}

      {/* Editor/Preview */}
      <div
        className={`grid gap-6 ${
          showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Editor */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={[
              "# Start writing your markdown here...",
              "",
              "You can use:",
              "- **Bold** and *italic* text",
              "- Lists and checkboxes",
              "- Code blocks",
              "- Tables",
              "- And much more!",
              "",
              "Click 'Share ✨' when you're ready to create a link.",
            ].join("\n")}
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
                  <div
                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            )}

            {/* Preview border glow animation on small screens */}
            <div
              className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-1000 lg:hidden ${
                showScrollIndicator
                  ? "opacity-100 ring-2 ring-purple-500/50 ring-offset-2 ring-offset-transparent"
                  : "opacity-0"
              }`}
            ></div>

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
          Supports{" "}
          <a
            href="https://github.github.com/gfm/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline transition-all"
          >
            GitHub Flavored Markdown
          </a>
          {" · "}
          Auto-saves locally as you type
          {" · "}
          No signup required
        </p>
      </div>
    </div>
  );
}
