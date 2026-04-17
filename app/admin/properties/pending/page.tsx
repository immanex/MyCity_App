'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PendingProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  // Pagination and Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties/pending');
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, ids: string[]) => {
    if (ids.length === 0) return;
    if (action === 'DELETE' && !confirm('Are you sure you want to delete these properties?')) return;

    try {
      const res = await fetch('/api/admin/properties/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, propertyIds: ids })
      });

      if (res.ok) {
        toast.success(`Action ${action} successful`);
        if (action === 'VERIFY' || action === 'DELETE') {
          setProperties(properties.filter(p => !ids.includes(p.id)));
          setSelectedIds(new Set());
        }
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProperties.map(p => p.id)));
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.agent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold">Verify Properties</h1>
        
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-sm w-64"
          />
          
          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <Button onClick={() => handleAction('VERIFY', Array.from(selectedIds))} className="bg-emerald-600 hover:bg-emerald-700">
                Verify Selected
              </Button>
              <Button onClick={() => handleAction('FEATURE', Array.from(selectedIds))} variant="outline" className="border-emerald-600 text-emerald-600">
                Feature Selected
              </Button>
              <Button onClick={() => handleAction('DELETE', Array.from(selectedIds))} variant="destructive">
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  checked={paginatedProperties.length > 0 && selectedIds.size === paginatedProperties.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300"
                />
              </th>
              <th className="p-4 font-medium">Property</th>
              <th className="p-4 font-medium">Agent</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedProperties.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No pending properties found.</td>
              </tr>
            ) : (
              paginatedProperties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(property.id)}
                      onChange={() => toggleSelect(property.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        {property.images?.[0]?.imageUrl && (
                          <img src={property.images[0].imageUrl} alt="cover" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{property.title}</p>
                        <p className="text-xs text-slate-500">{property.area}, {property.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sm">{property.agent.fullName}</p>
                    <p className="text-xs text-slate-500">{property.agent.email}</p>
                  </td>
                  <td className="p-4 font-medium">{property.priceDisplay}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(property.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedProperty(property)} className="text-slate-600 hover:bg-slate-100">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction('VERIFY', [property.id])} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <CheckCircle className="w-4 h-4 mr-1" /> Verify
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAction('DELETE', [property.id])} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">{selectedProperty?.title}</DialogTitle>
            <DialogDescription>
              {selectedProperty?.area}, {selectedProperty?.city}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Price</p>
                  <p className="font-bold text-lg">{selectedProperty.priceDisplay}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="font-medium">{selectedProperty.propertyType} - {selectedProperty.listingType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Beds / Baths</p>
                  <p className="font-medium">{selectedProperty.beds} Beds, {selectedProperty.baths} Baths</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Agent</p>
                  <p className="font-medium">{selectedProperty.agent.fullName} ({selectedProperty.agent.email})</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-500">Description</p>
                <p className="text-sm whitespace-pre-wrap">{selectedProperty.description}</p>
              </div>

              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProperty.images.map((img: any) => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img src={img.imageUrl} alt="Property" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedProperty(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleAction('VERIFY', [selectedProperty.id]);
                    setSelectedProperty(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Verify Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
