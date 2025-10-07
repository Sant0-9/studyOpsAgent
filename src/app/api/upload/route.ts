import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db/prisma';
import { MaterialType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const assignmentId = formData.get('assignmentId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedMaterials = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Determine material type
      let materialType: MaterialType = MaterialType.OTHER;
      if (file.type === 'application/pdf') {
        materialType = MaterialType.PDF;
      } else if (file.type.startsWith('image/')) {
        materialType = MaterialType.IMAGE;
      } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
        materialType = MaterialType.TEXT;
      }

      // Extract text content for text files
      let content = null;
      if (materialType === MaterialType.TEXT) {
        content = buffer.toString('utf-8');
      }

      // Create database entry
      const material = await prisma.studyMaterial.create({
        data: {
          title: file.name,
          type: materialType,
          fileUrl: `/uploads/${filename}`,
          fileSize: file.size,
          content,
          assignmentId: assignmentId || null,
        },
      });

      uploadedMaterials.push(material);
    }

    return NextResponse.json({
      success: true,
      data: uploadedMaterials,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
