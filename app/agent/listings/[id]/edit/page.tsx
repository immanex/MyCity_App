import ListingForm from '@/components/agent/ListingForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      amenities: true
    }
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Edit Listing</h1>
        <p className="text-slate-500 mt-2">Update the details for this property.</p>
      </div>
      <ListingForm initialData={property} />
    </div>
  );
}
