'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Target, ArrowRight } from 'lucide-react';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState('Lagos');
  const [intent, setIntent] = useState('Buy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onboarded = localStorage.getItem('mycity_onboarded');
    if (!onboarded) {
      setIsOpen(true);
    }
  }, []);

  if (!mounted || !isOpen) return null;

  const handleEnter = () => {
    localStorage.setItem('mycity_onboarded', 'true');
    localStorage.setItem('mycity_city', city);
    localStorage.setItem('mycity_intent', intent);
    setIsOpen(false);
    window.location.reload(); // Reload to apply city filter
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="relative h-48 bg-emerald-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
            </div>
            <div className="relative text-center space-y-2">
              <h2 className="text-white text-4xl font-serif font-bold">MyCity</h2>
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-widest">Discover Where You Belong</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Select Your City
                </label>
                <Select value={city} onValueChange={(val) => setCity(val || '')}>
                  <SelectTrigger className="h-14 rounded-xl border-slate-200 text-lg font-medium">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Your Intent
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Buy', 'Rent', 'Invest'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setIntent(option)}
                      className={`h-14 rounded-xl border-2 transition-all font-medium ${
                        intent === option
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleEnter}
              className="w-full h-16 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-bold shadow-lg shadow-emerald-700/20 group"
            >
              Enter MyCity
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
