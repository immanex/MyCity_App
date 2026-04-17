'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Trash2, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const res = await fetch('/api/saved-searches');
      if (res.status === 401) {
        router.push('/login?redirect=/saved-searches');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearches(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSearches(searches.filter(s => s.id !== id));
        toast.success('Saved search deleted');
      }
    } catch (error) {
      toast.error('Failed to delete search');
    }
  };

  const handleRunSearch = (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-slate-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
            <Bookmark className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold">Saved Searches</h1>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : searches.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100 shadow-sm space-y-4">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif font-bold">No saved searches yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Save a search from the Explore page to quickly access your favorite filters and locations.
            </p>
            <Button asChild className="mt-4 bg-emerald-700 hover:bg-emerald-800 rounded-xl">
              <Link href="/explore">Go to Explore</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {searches.map((search) => (
              <div key={search.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{search.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(search.filters).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <span key={key} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                          {key}: {String(value)}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 pt-2">
                    Saved on {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => handleDelete(search.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleRunSearch(search.filters)} className="bg-emerald-700 hover:bg-emerald-800 rounded-xl">
                    Run Search <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomTab />
    </div>
  );
}
