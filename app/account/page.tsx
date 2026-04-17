'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Loader2, Sparkles, MapPin, Home as HomeIcon, Shield, Camera, Phone, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type Tab = 'profile' | 'preferences' | 'security';

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  // Security Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          profileImage: profile.profileImage
        })
      });
      if (res.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        toast.success('Preferences saved! Feed updated.');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSavingSecurity(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setSavingSecurity(false);
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
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 pt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64 space-y-3">
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="h-24 w-24 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'];
  const TYPES = ['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL'];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 pt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-2 text-sm">Manage your profile, security, and personalize your experience.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5" /> Profile Information
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'preferences' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-5 h-5" /> AI Personalization
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'security' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Shield className="w-5 h-5" /> Security
            </button>
            
            <div className="pt-4 mt-4 border-t border-slate-200">
              {profile?.role === 'AGENT' || profile?.role === 'ADMIN' ? (
                <Link 
                  href={profile.role === 'ADMIN' ? '/admin' : '/agent/dashboard'}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <Settings className="w-5 h-5" /> Portal Access
                </Link>
              ) : null}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Profile Information</h2>
                  <p className="text-sm text-slate-500">Update your account's public-facing details.</p>
                </div>
                
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                    <button type="button" className="absolute bottom-0 w-full h-1/3 bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image URL</label>
                    <input 
                      type="url" 
                      value={profile?.profileImage || ''}
                      onChange={(e) => setProfile({...profile, profileImage: e.target.value})}
                      placeholder="https://..."
                      className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profile?.fullName || ''}
                        onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        required
                      />
                      <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="tel"
                        value={profile?.phoneNumber || ''}
                        onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="+234..."
                      />
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm"
                      />
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Email address cannot be changed.</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleSavePreferences} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">AI Personalization</h2>
                  <p className="text-sm text-slate-500">Teach the AI what properties you like the most.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Preferred Cities
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

                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                      <HomeIcon className="w-4 h-4 text-emerald-600" /> Property Types
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

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Parameters'}
                  </button>
                </div>
              </form>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Change Password</h2>
                  <p className="text-sm text-slate-500">Update your account password to stay secure.</p>
                </div>

                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingSecurity || !newPassword || newPassword !== confirmPassword}
                    className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {savingSecurity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
