import { prisma } from '@/lib/db/prisma';
import { MaterialsClient } from './materials-client';

export default async function MaterialsPage() {
  const materials = await prisma.studyMaterial.findMany({
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });

  const assignments = await prisma.assignment.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  return <MaterialsClient materials={materials} assignments={assignments} />;
}
