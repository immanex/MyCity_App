import ListingForm from '@/components/agent/ListingForm';

export default function NewListingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Add New Listing</h1>
        <p className="text-slate-500 mt-2">Fill in the details below to publish a new property.</p>
      </div>
      <ListingForm />
    </div>
  );
}
