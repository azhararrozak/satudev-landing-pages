import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    console.log('Received file:', file);
    console.log('File type:', typeof file);
    console.log('File instanceof File:', file instanceof File);
    console.log('File instanceof Blob:', file instanceof Blob);

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file uploaded or invalid file type' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WEBP, and GIF are allowed` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    // Handle both File (has name property) and Blob (no name property)
    let originalName = 'generated-image.png';
    
    if (file instanceof File && file.name) {
      originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    
    const fileName = `${timestamp}-${originalName}`;
    
    console.log('Generated filename:', fileName);
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'featuredImageBlog');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    console.log('File saved to:', filePath);

    // Return public URL
    const publicUrl = `/featuredImageBlog/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
