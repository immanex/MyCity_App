'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AgentInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/agent/inquiries');
      const data = await res.json();
      if (data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/agent/inquiries/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      if (res.ok) {
        setInquiries(inquiries.map(i => i.id === id ? { ...i, isRead: true } : i));
        toast.success('Marked as read');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div className="p-8">Loading inquiries...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-serif font-bold">Inquiries</h1>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-100">
            No inquiries yet.
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className={`bg-white p-6 rounded-2xl border ${inquiry.isRead ? 'border-slate-100' : 'border-emerald-200 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {!inquiry.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    <h3 className="font-bold text-lg">{inquiry.user.fullName}</h3>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-emerald-700">Re: {inquiry.property.title}</p>
                  <p className="text-slate-600 mt-2">{inquiry.message}</p>
                  
                  <div className="flex items-center gap-4 pt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" /> {inquiry.user.email}
                    </div>
                    {inquiry.user.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {inquiry.user.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800">
                    <a href={`mailto:${inquiry.user.email}?subject=Re: Your inquiry about ${inquiry.property.title}`}>
                      Reply via Email
                    </a>
                  </Button>
                  {!inquiry.isRead && (
                    <Button variant="outline" className="w-full" onClick={() => markAsRead(inquiry.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
