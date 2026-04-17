'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

const REASONS = [
  "Fake listing",
  "Wrong price",
  "Already sold",
  "Other"
];

export default function ReportModal({ isOpen, onClose, propertyId, propertyTitle }: ReportModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          reason,
          description
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        toast.success('Report submitted successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold">Report Listing</DialogTitle>
              <DialogDescription>
                Tell us what's wrong with "{propertyTitle}". Your report helps us keep the marketplace safe.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Reason</label>
                <div className="grid grid-cols-1 gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        reason === r 
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900' 
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-bold">{r}</span>
                      {reason === r && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about the issue..."
                  className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-emerald-500 transition-all font-medium text-slate-900 resize-none"
                />
              </div>

              <DialogFooter className="flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-widest shadow-lg shadow-emerald-700/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Thank you!</h3>
              <p className="text-slate-500">We've received your report and will investigate it shortly.</p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
