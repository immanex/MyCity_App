'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

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

  const syncUserIdentity = async () => {
    try {
      await fetch('/api/auth/sync', { method: 'POST' });
    } catch (e) {
      console.error('Failed to sync user', e);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!fullName) return toast.error('Please enter your full name');
        
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        
        if (data.session) {
          await syncUserIdentity();
          toast.success('Account created successfully!');
          window.location.href = redirect;
        } else {
          toast.success('Check your email for the confirmation link');
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.session) {
          await syncUserIdentity();
          toast.success('Logged in successfully!');
          window.location.href = redirect;
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Link href="/" className="absolute top-8 left-8 md:flex items-center gap-2 text-slate-500 hover:text-emerald-700 transition-colors hidden">
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-emerald-700 text-center space-y-2 relative">
          <Link href="/" className="md:hidden absolute top-6 left-6 text-emerald-50">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">MyCity</h1>
          <p className="text-emerald-100 text-sm uppercase tracking-widest font-medium">Premium Real Estate</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isSignUp ? 'Sign up to find your dream property' : 'Sign in to sync your saved properties.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="you@example.com"
                  required
                />
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or Access With</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>

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
