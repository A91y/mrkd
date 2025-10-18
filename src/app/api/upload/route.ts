// POST /api/upload - Upload markdown content to S3

import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, isS3Configured } from '@/lib/s3';
import { generateId, validateContent, getShareUrl, createMetadata, appendMetadata, hashIP, hashEditKey, calculateExpirationDate } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check S3 configuration
    if (!isS3Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'S3 is not properly configured',
        },
        { status: 500 }
      );
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: MESSAGES.RATE_LIMIT_EXCEEDED,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, name, isEncrypted, editKey, expirationDays } = body;

    // Validate content
    const validation = validateContent(content);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || MESSAGES.INVALID_CONTENT,
        },
        { status: 400 }
      );
    }

    // Create metadata
    const hashedIP = await hashIP(ip);
    const metadata = createMetadata(name, hashedIP);
    
    // Set encryption flag
    if (isEncrypted) {
      metadata.is_encrypted = true;
    }
    
    // Hash and store edit key if provided
    if (editKey && editKey.trim()) {
      const hashedEditKey = await hashEditKey(editKey.trim());
      metadata.edit_key_hash = hashedEditKey;
    }

    // Set expiration date if provided and not -1 (never)
    if (expirationDays && expirationDays !== -1) {
      metadata.expires_at = calculateExpirationDate(expirationDays);
    }

    // Append metadata to content
    const contentWithMetadata = appendMetadata(content, metadata);

    // Generate unique ID (with collision check)
    let id = generateId();
    let attempts = 0;
    const maxAttempts = 5;

    // In a production app, you'd check for collisions in a database
    // For now, we'll just generate a new ID if upload fails
    while (attempts < maxAttempts) {
      const uploaded = await uploadToS3(id, contentWithMetadata);

      if (uploaded) {
        const url = getShareUrl(id);

        return NextResponse.json(
          {
            success: true,
            id,
            url,
          },
          { status: 200 }
        );
      }

      id = generateId();
      attempts++;
    }

    // If we get here, upload failed after multiple attempts
    return NextResponse.json(
      {
        success: false,
        error: MESSAGES.UPLOAD_ERROR,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: MESSAGES.UPLOAD_ERROR,
      },
      { status: 500 }
    );
  }
}