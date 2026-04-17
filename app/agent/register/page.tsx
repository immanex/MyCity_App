'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AgentRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    agencyName: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Registration successful. Please log in.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-emerald-700">MyCity Agent</h1>
          <p className="text-slate-500 mt-2">Create your agent account to start listing properties.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full p-3 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              minLength={6}
              className="w-full p-3 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              className="w-full p-3 rounded-xl border border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Agency Name (Optional)</label>
            <input 
              type="text" 
              name="agencyName" 
              value={formData.agencyName} 
              onChange={handleChange} 
              className="w-full p-3 rounded-xl border border-slate-200"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-lg font-bold mt-6">
            {isSubmitting ? 'Registering...' : 'Register as Agent'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-emerald-700 font-bold">Log in</a>
        </div>
      </div>
    </div>
  );
}
