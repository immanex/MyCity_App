'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

export default function InquiryModal({ isOpen, onClose, property }: InquiryModalProps) {
  const [message, setMessage] = useState(`Hi, I'm interested in this property. Is it still available?`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to send an inquiry');
      window.location.href = `/login?redirect=/properties/${property.id}`;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          message,
          contactType: 'IN_APP',
        }),
      });

      if (res.ok) {
        toast.success('Message sent. The agent will contact you shortly.');
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send inquiry');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-slate-900">Contact Agent</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                <img
                  src={property.images?.find((img: any) => img.isCover)?.imageUrl || property.images?.[0]?.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-bold text-slate-900 truncate">{property.title}</p>
                <p className="text-emerald-700 font-bold">{property.priceDisplay}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px] rounded-xl border-slate-200 focus:ring-emerald-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg group"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Inquiry
                  <Send className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
