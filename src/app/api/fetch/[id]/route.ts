// GET /api/fetch/[id] - Fetch markdown content from S3

import { NextRequest, NextResponse } from 'next/server';
import { fetchFromS3, isS3Configured } from '@/lib/s3';
import { validateId, extractMetadata } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get and validate ID
    const { id } = await params;

    if (!validateId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    }

    // Fetch from S3
    const result = await fetchFromS3(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || MESSAGES.NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Extract and strip metadata from content
    const { content: cleanContent, metadata: docMetadata } = extractMetadata(result.content || '');

    // Log metadata for backend use (analytics, moderation, etc.)
    if (docMetadata) {
      console.log('Document metadata:', {
        id,
        created_at: docMetadata.created_at,
        has_name: !!docMetadata.name,
        version: docMetadata.version,
        // Don't log full metadata to avoid leaking IP hashes in logs
      });
    }

    // Return clean content (without metadata) to frontend
    // Only include basic metadata (created_at, size, encryption flag, editability, and version)
    return NextResponse.json(
      {
        success: true,
        content: cleanContent,
        metadata: {
          createdAt: docMetadata?.created_at || result.metadata?.createdAt,
          size: result.metadata?.size,
          isEncrypted: docMetadata?.is_encrypted || false,
          isEditable: !!docMetadata?.edit_key_hash,
          name: docMetadata?.name,
          version: docMetadata?.version || '1.0',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
      },
      { status: 500 }
    );
  }
}
