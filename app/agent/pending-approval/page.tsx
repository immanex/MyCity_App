import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-slate-900">Account Pending Approval</h1>
          <p className="text-slate-500">
            Your agent account has been created successfully, but it is currently pending review by our administration team.
          </p>
          <p className="text-slate-500">
            You will be able to access the agent dashboard and list properties once your account is approved.
          </p>
        </div>

        <Button asChild className="w-full bg-emerald-700 hover:bg-emerald-800 rounded-xl">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
