'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, MoreVertical, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AgentListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/agent/listings');
      const data = await res.json();
      if (data.properties) {
        setListings(data.properties);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/agent/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Listing deleted');
        setListings(listings.filter(l => l.id !== id));
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      toast.error('Error deleting listing');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/agent/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        setListings(listings.map(l => l.id === id ? { ...l, status } : l));
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  if (isLoading) return <div className="p-8">Loading listings...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">My Listings</h1>
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
          <Link href="/agent/listings/new">Add New Listing</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-medium">Property</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Stats</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No listings found. Create your first listing to get started.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {listing.images?.[0]?.imageUrl ? (
                            <Image
                              src={listing.images[0].imageUrl}
                              alt={listing.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{listing.title}</p>
                          <p className="text-sm text-slate-500">{listing.area}, {listing.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{listing.priceDisplay}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {listing.listingType}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={listing.status}
                        onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-0 cursor-pointer ${
                          listing.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                          listing.status === 'SOLD' ? 'bg-amber-50 text-amber-700' :
                          'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="SOLD">Sold</option>
                        <option value="RENTED">Rented</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1" title="Views">
                          <Eye className="w-4 h-4" /> {listing.views}
                        </div>
                        <div className="flex items-center gap-1" title="Leads">
                          <MessageSquare className="w-4 h-4" /> {listing.leads}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/agent/listings/${listing.id}/edit`}>
                            <Edit className="w-4 h-4 text-slate-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
