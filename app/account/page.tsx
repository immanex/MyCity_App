'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Loader2, Sparkles, MapPin, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const [profRes, prefsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/preferences')
        ]);
        
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
        }
        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          setPreferences(prefsData);
        }
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        setSuccessMsg('Preferences saved successfully! Your feed is updated.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleCityChange = (city: string) => {
    const current = preferences.preferredCities || [];
    if (current.includes(city)) {
      setPreferences({ ...preferences, preferredCities: current.filter((c: string) => c !== city) });
    } else {
      setPreferences({ ...preferences, preferredCities: [...current, city] });
    }
  };

  const handlePropertyTypeChange = (type: string) => {
    const current = preferences.propertyTypes || [];
    if (current.includes(type)) {
      setPreferences({ ...preferences, propertyTypes: current.filter((t: string) => t !== type) });
    } else {
      setPreferences({ ...preferences, propertyTypes: [...current, type] });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'];
  const TYPES = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Account</h1>
          <p className="text-slate-500 mt-2 text-sm">Manage your profile and personalize your experience.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {profile?.fullName?.charAt(0) || <User />}
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{profile?.fullName}</h2>
              <p className="text-sm text-slate-500">{profile?.email}</p>
              
              <div className="mt-8 w-full space-y-2">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {profile?.role === 'AGENT' || profile?.role === 'ADMIN' ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" /> Dashboard Access
                </h3>
                <Link 
                  href={profile.role === 'ADMIN' ? '/admin' : '/agent/dashboard'}
                  className="block w-full text-center py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Go to {profile.role === 'ADMIN' ? 'Admin' : 'Agent'} Portal
                </Link>
              </div>
            ) : null}
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">AI Personalization</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Teach the AI what properties you like the most.</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* City Preferences */}
                <div>
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-slate-400" /> Preferred Cities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(city => {
                      const isSelected = (preferences.preferredCities || []).includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCityChange(city)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            isSelected 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                    <HomeIcon className="w-4 h-4 text-slate-400" /> Property Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(type => {
                      const isSelected = (preferences.propertyTypes || []).includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handlePropertyTypeChange(type)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            isSelected 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget & Beds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Budget (₦)
                    </label>
                    <input 
                      type="number"
                      value={preferences.maxPrice || ''}
                      onChange={(e) => setPreferences({...preferences, maxPrice: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="e.g. 50000000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Minimum Beds
                    </label>
                    <input 
                      type="number"
                      min="0"
                      max="10"
                      value={preferences.minBeds || ''}
                      onChange={(e) => setPreferences({...preferences, minBeds: e.target.value ? parseInt(e.target.value) : null})}
                      placeholder="e.g. 2"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {successMsg && (
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in zoom-in duration-300">
                      {successMsg}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Parameters'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
