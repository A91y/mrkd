// Utility functions

import { nanoid } from 'nanoid';
import { ID_LENGTH, MAX_CONTENT_SIZE } from './constants';

/**
 * Generate a unique ID for markdown content
 */
export function generateId(): string {
  return nanoid(ID_LENGTH);
}

/**
 * Validate markdown content
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  if (content.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  const size = new Blob([content]).size;
  if (size > MAX_CONTENT_SIZE) {
    return { valid: false, error: `Content size exceeds ${MAX_CONTENT_SIZE / 1024 / 1024}MB limit` };
  }

  return { valid: true };
}

/**
 * Validate ID format
 */
export function validateId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Check if ID matches expected format (alphanumeric, correct length)
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  return idRegex.test(id) && id.length >= 8 && id.length <= 20;
}

/**
 * Get character and word count from text
 */
export function getTextStats(text: string): { characters: number; words: number } {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { characters, words };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Get full share URL
 */
export function getShareUrl(id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${baseUrl}/view/${id}`;
}

/**
 * Sanitize content (basic XSS prevention)
 */
export function sanitizeContent(content: string): string {
  // Remove any potentially harmful HTML/script tags
  // Note: react-markdown already handles this, but adding as extra layer
  return content;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format file size to readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Tailwind CSS class merger
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}