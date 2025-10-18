// POST /api/verify-edit-key/[id] - Verify edit key for a document

import { NextRequest, NextResponse } from 'next/server';
import { fetchFromS3, isS3Configured } from '@/lib/s3';
import { validateId, extractMetadata, hashEditKey } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

export async function POST(
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
          error: 'Invalid document ID',
        },
        { status: 400 }
      );
    }

    // Get edit key from request body
    const body = await request.json();
    const { editKey } = body;

    if (!editKey || !editKey.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Edit key is required',
        },
        { status: 400 }
      );
    }

    // Fetch document from S3
    const result = await fetchFromS3(id);
    if (!result.success || !result.content) {
      return NextResponse.json(
        {
          success: false,
          error: MESSAGES.NOT_FOUND,
        },
        { status: 404 }
      );
    }

    // Extract metadata
    const { metadata: docMetadata } = extractMetadata(result.content);

    // Check if document has edit key
    if (!docMetadata?.edit_key_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'This document is not editable',
        },
        { status: 403 }
      );
    }

    // Hash provided edit key and compare
    const hashedProvidedKey = await hashEditKey(editKey.trim());
    
    if (hashedProvidedKey !== docMetadata.edit_key_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid edit key',
        },
        { status: 403 }
      );
    }

    // Edit key is valid
    return NextResponse.json(
      {
        success: true,
        message: 'Edit key verified',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Edit key verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify edit key',
      },
      { status: 500 }
    );
  }
}

