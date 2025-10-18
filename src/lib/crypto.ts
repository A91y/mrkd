// Client-side encryption utilities using Web Crypto API
// Symmetric encryption with AES-256-GCM

/**
 * Derive a key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt content with a password
 * Returns format: salt:iv:encryptedContent (all base64)
 */
export async function encryptContent(content: string, password: string): Promise<string> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Encrypt content
    const encoder = new TextEncoder();
    const contentBuffer = encoder.encode(content);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      contentBuffer
    );

    // Convert to base64
    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...iv));
    const encryptedB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    // Return combined format
    return `${saltB64}:${ivB64}:${encryptedB64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypt content with a password
 * Expects format: salt:iv:encryptedContent (all base64)
 */
export async function decryptContent(encryptedData: string, password: string): Promise<string> {
  try {
    // Parse the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltB64, ivB64, encryptedB64] = parts;

    // Convert from base64
    const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(ivB64).split('').map(c => c.charCodeAt(0)));
    const encryptedBuffer = new Uint8Array(atob(encryptedB64).split('').map(c => c.charCodeAt(0)));

    // Derive key from password
    const key = await deriveKey(password, salt);

    // Decrypt content
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt content. Wrong password?');
  }
}

/**
 * Check if browser supports Web Crypto API
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}

