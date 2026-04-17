'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const redirect = searchParams.get('redirect') || '/';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-emerald-700 text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-white">MyCity</h1>
          <p className="text-emerald-100 text-sm uppercase tracking-widest font-medium">Premium Real Estate</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500">Sign in to sync your saved properties and inquiries across devices.</p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Secure Access</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By continuing, you agree to MyCity's <br />
            <Link href="/terms" className="underline hover:text-emerald-700">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-emerald-700">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
