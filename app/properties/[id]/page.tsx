'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import BottomTab from '@/components/layout/BottomTab';
import InquiryModal from '@/components/property/InquiryModal';
import ReportModal from '@/components/property/ReportModal';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useEmblaCarousel from 'embla-carousel-react';

import PropertyMap from '@/components/map/PropertyMap';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Property not found');
        const data = await res.json();
        setProperty(data);
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          console.error('Failed to fetch property:', error);
          toast.error('Property not found');
          router.push('/explore');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();

    return () => {
      controller.abort();
    };
  }, [id, router]);

  const toggleSave = async () => {
    // Similar to PropertyCard toggleSave
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved to your list');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 space-y-8">
          <div className="aspect-[21/9] bg-slate-100 animate-pulse rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 bg-slate-100 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-slate-100 rounded w-1/2 animate-pulse" />
              <div className="h-32 bg-slate-100 rounded w-full animate-pulse" />
            </div>
            <div className="h-64 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      <Navbar />
      
      {/* Mobile Header Actions */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] p-4 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={handleShare} className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={toggleSave} className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-24 space-y-12">
        {/* Gallery */}
        <section className="relative group">
          <div className="overflow-hidden rounded-[2.5rem] shadow-2xl" ref={emblaRef}>
            <div className="flex">
              {property.images.map((img: any, i: number) => (
                <div key={img.id} className="relative flex-[0_0_100%] min-w-0 aspect-[4/3] md:aspect-[21/9]">
                  <Image
                    src={img.imageUrl}
                    alt={`${property.title} - Image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {property.images.length > 1 && (
            <>
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 active:scale-90"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-8 right-8 bg-black/60 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/10">
                {property.images.length} Photos
              </div>
            </>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Header Info */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-700/20">
                  {property.listingType}
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-slate-200">
                  {property.propertyType}
                </span>
                {property.isVerified && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-tight tracking-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500 text-xl font-medium">
                    <MapPin className="w-6 h-6 text-emerald-700" />
                    {property.address}, {property.area}, {property.city}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-serif font-black text-emerald-700 tracking-tighter">
                  {property.priceDisplay}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bedrooms</p>
                    <p className="text-lg font-bold text-slate-900">{property.beds}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                    <Bath className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bathrooms</p>
                    <p className="text-lg font-bold text-slate-900">{property.baths}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                    <Maximize className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Area</p>
                    <p className="text-lg font-bold text-slate-900">{property.sqm}m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Listed</p>
                    <p className="text-lg font-bold text-slate-900">
                      {new Date(property.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-slate-900">About this property</h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {property.amenities.map((item: any) => (
                  <div key={item.amenity.id} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 transition-colors hover:bg-white hover:shadow-md group">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{item.amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Map */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Location</h2>
              <PropertyMap latitude={property.latitude} longitude={property.longitude} />
            </div>
          </div>

          {/* Sidebar / Contact Card */}
          <div className="space-y-8">
            <div className="sticky top-32 space-y-8">
              <div className="card-premium p-8 space-y-8">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-emerald-100 border-4 border-emerald-50">
                    <Image
                      src={property.agent.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.agent.fullName)}&background=059669&color=fff`}
                      alt={property.agent.fullName}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900">{property.agent.fullName}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Premium Agent</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => setIsInquiryOpen(true)}
                    className="w-full h-16 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg shadow-lg shadow-emerald-700/20"
                  >
                    Contact Agent
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest hover:bg-slate-50">
                      <Phone className="w-4 h-4" /> Call
                    </Button>
                    <Button variant="outline" className="h-14 rounded-2xl border-slate-200 gap-2 font-bold text-xs uppercase tracking-widest hover:bg-slate-50">
                      <Mail className="w-4 h-4" /> Email
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 text-center space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Property ID</p>
                    <p className="text-sm font-mono font-bold text-slate-600 mt-1">{property.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  
                  <button 
                    onClick={() => setIsReportOpen(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report this listing
                  </button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  Safety Tips
                </div>
                <ul className="text-xs text-blue-600 space-y-2 list-disc pl-4">
                  <li>Never pay any upfront fees before inspection.</li>
                  <li>Always meet the agent in a public place.</li>
                  <li>Verify all documents with a legal professional.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <InquiryModal 
        isOpen={isInquiryOpen} 
        onClose={() => setIsInquiryOpen(false)} 
        property={property} 
      />
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />
      <BottomTab />
    </div>
  );
}
