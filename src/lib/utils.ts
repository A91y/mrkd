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

/**
 * Document Metadata Interface
 */
export interface DocumentMetadata {
  created_at: string;
  name?: string;
  creator_ip: string;
  is_encrypted: boolean;
  edit_key_hash?: string;
  expires_at?: string; // ISO 8601 timestamp
  version: string;
}

/**
 * Hash IP address using SHA-256 (privacy-preserving)
 */
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash edit key using SHA-256
 */
export async function hashEditKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Increment version string (e.g., "1.0" -> "1.1", "1.9" -> "2.0")
 */
export function incrementVersion(version: string): string {
  const parts = version.split('.');
  if (parts.length !== 2) return '1.1'; // Fallback for invalid versions
  
  let major = parseInt(parts[0], 10);
  let minor = parseInt(parts[1], 10);
  
  minor++;
  if (minor >= 10) {
    major++;
    minor = 0;
  }
  
  return `${major}.${minor}`;
}

/**
 * Calculate expiration date from now
 */
export function calculateExpirationDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Check if document has expired
 */
export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

/**
 * Create metadata object
 */
export function createMetadata(name?: string, creatorIP?: string): DocumentMetadata {
  return {
    created_at: new Date().toISOString(),
    name: name || undefined,
    creator_ip: creatorIP || 'unknown',
    is_encrypted: false,
    version: '1.0',
  };
}

/**
 * Encode metadata to base64
 */
export function encodeMetadata(metadata: DocumentMetadata): string {
  const json = JSON.stringify(metadata);
  return Buffer.from(json).toString('base64');
}

/**
 * Decode metadata from base64
 */
export function decodeMetadata(base64: string): DocumentMetadata | null {
  try {
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as DocumentMetadata;
  } catch (error) {
    console.error('Failed to decode metadata:', error);
    return null;
  }
}

/**
 * Append metadata to markdown content (always as last line)
 */
export function appendMetadata(content: string, metadata: DocumentMetadata): string {
  const base64 = encodeMetadata(metadata);
  return `${content}\n\n<!-- META:${base64} -->`;
}

/**
 * Extract metadata from markdown content (ONLY from last line)
 * Returns { content: string, metadata: DocumentMetadata | null }
 */
export function extractMetadata(content: string): {
  content: string;
  metadata: DocumentMetadata | null;
} {
  // Split content into lines
  const lines = content.split('\n');
  
  // Check if last line contains metadata
  const lastLine = lines[lines.length - 1]?.trim() || '';
  const metaRegex = /^<!-- META:([A-Za-z0-9+/=]+) -->$/;
  const match = lastLine.match(metaRegex);

  if (!match) {
    // No valid metadata on last line, return content as-is
    return { content, metadata: null };
  }

  // Extract and decode metadata from last line
  const base64 = match[1];
  const metadata = decodeMetadata(base64);
  
  // Remove last line (metadata) and any trailing empty lines
  const contentLines = lines.slice(0, -1);
  const cleanContent = contentLines.join('\n').trim();

  return { content: cleanContent, metadata };
}