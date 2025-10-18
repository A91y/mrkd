// PUT /api/update/[id] - Update an existing markdown document

import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, fetchFromS3, isS3Configured } from '@/lib/s3';
import { 
  validateId, 
  validateContent, 
  hashEditKey, 
  extractMetadata, 
  appendMetadata, 
  createMetadata,
  hashIP,
  incrementVersion
} from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

export async function PUT(
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

    // Parse request body
    const body = await request.json();
    const { content, editKey, isEncrypted } = body;

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

    // Validate edit key
    if (!editKey || !editKey.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Edit key is required for updates',
        },
        { status: 400 }
      );
    }

    // Fetch existing document
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

    // Extract existing metadata
    const { metadata: existingMetadata } = extractMetadata(result.content);

    // Check if document has edit key
    if (!existingMetadata?.edit_key_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'This document is not editable',
        },
        { status: 403 }
      );
    }

    // Verify edit key
    const hashedProvidedKey = await hashEditKey(editKey.trim());
    if (hashedProvidedKey !== existingMetadata.edit_key_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid edit key',
        },
        { status: 403 }
      );
    }

    // Create updated metadata (preserve original data, update encryption flag, increment version)
    const currentVersion = existingMetadata.version || '1.0';
    const newVersion = incrementVersion(currentVersion);
    
    const updatedMetadata = {
      ...existingMetadata,
      is_encrypted: isEncrypted || existingMetadata.is_encrypted,
      version: newVersion
    };

    // Append metadata to new content
    const contentWithMetadata = appendMetadata(content, updatedMetadata);
    
    console.log(`Document ${id} updated: ${currentVersion} → ${newVersion}`);

    // Upload updated content to S3 (overwrites existing)
    const uploaded = await uploadToS3(id, contentWithMetadata);

    if (uploaded) {
      return NextResponse.json(
        {
          success: true,
          id,
          message: 'Document updated successfully',
          version: newVersion,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: MESSAGES.UPLOAD_ERROR,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update document',
      },
      { status: 500 }
    );
  }
}

