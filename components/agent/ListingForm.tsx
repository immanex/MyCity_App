'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Star } from 'lucide-react';

export default function ListingForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    city: initialData?.city || 'Lagos',
    area: initialData?.area || '',
    fullAddress: initialData?.fullAddress || '',
    priceNumeric: initialData?.priceNumeric || '',
    propertyType: initialData?.propertyType || 'HOUSE',
    listingType: initialData?.listingType || 'BUY',
    beds: initialData?.beds || '',
    baths: initialData?.baths || '',
    toilets: initialData?.toilets || '',
    sqm: initialData?.sqm || '',
    latitude: initialData?.latitude || 6.45,
    longitude: initialData?.longitude || 3.4,
    amenityIds: initialData?.amenities?.map((a: any) => a.amenityId) || [],
    images: initialData?.images || []
  });

  useEffect(() => {
    // Fetch amenities
    fetch('/api/amenities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAmenitiesList(data);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (id: string) => {
    setFormData(prev => {
      const current = prev.amenityIds;
      if (current.includes(id)) {
        return { ...prev, amenityIds: current.filter((a: string) => a !== id) };
      } else {
        return { ...prev, amenityIds: [...current, id] };
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (formData.images.length + acceptedFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setIsUploading(true);
    try {
      const newImages = [];
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        newImages.push({
          imageUrl: publicUrl,
          isCover: formData.images.length === 0 && newImages.length === 0
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Ensure the "property-images" bucket exists and is public.');
    } finally {
      setIsUploading(false);
    }
  }, [formData.images, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 10
  });

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      // If we removed the cover image, set the first remaining image as cover
      if (newImages.length > 0 && !newImages.some(img => img.isCover)) {
        newImages[0].isCover = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const setCoverImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isCover: i === index }))
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceNumeric: Number(formData.priceNumeric),
        beds: formData.beds ? Number(formData.beds) : null,
        baths: formData.baths ? Number(formData.baths) : null,
        toilets: formData.toilets ? Number(formData.toilets) : null,
        sqm: formData.sqm ? Number(formData.sqm) : null,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      const url = initialData ? `/api/agent/listings/${initialData.id}` : '/api/agent/listings';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(initialData ? 'Listing updated' : 'Listing published');
        router.push('/agent/listings');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save listing');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {s}
            </div>
            {s < 5 && <div className={`w-12 md:w-24 h-1 mx-2 ${step > s ? 'bg-emerald-600' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" required />
            </div>
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <select name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200">
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Area</label>
              <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" placeholder="e.g. Lekki Phase 1" />
            </div>
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium">Full Address</label>
              <input type="text" name="fullAddress" value={formData.fullAddress} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (Numeric)</label>
              <input type="number" name="priceNumeric" value={formData.priceNumeric} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200">
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Listing Type</label>
              <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200">
                <option value="BUY">Buy</option>
                <option value="RENT">Rent</option>
                <option value="SHORTLET">Shortlet</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beds</label>
              <input type="number" name="beds" value={formData.beds} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Baths</label>
              <input type="number" name="baths" value={formData.baths} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Toilets</label>
              <input type="number" name="toilets" value={formData.toilets} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SQM</label>
              <input type="number" name="sqm" value={formData.sqm} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold">Location Coordinates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-500">
            Map integration will be added in Phase 4. For now, please enter coordinates manually.
          </div>
        </div>
      )}

      {/* Step 3: Amenities */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenitiesList.map(amenity => (
              <label key={amenity.id} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                <input 
                  type="checkbox" 
                  checked={formData.amenityIds.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <span className="font-medium">{amenity.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Images */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold">Images</h2>
          
          <div 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <p className="text-emerald-600 font-medium">Uploading images...</p>
            ) : isDragActive ? (
              <p className="text-emerald-600 font-medium">Drop the files here ...</p>
            ) : (
              <div>
                <p className="text-slate-600 font-medium mb-2">Drag & drop images here, or click to select files</p>
                <p className="text-xs text-slate-400">Max 10 images. First image will be the cover.</p>
              </div>
            )}
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {formData.images.map((img: any, i: number) => (
                <div key={i} className={`relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border-2 ${img.isCover ? 'border-emerald-500' : 'border-transparent'}`}>
                  <img src={img.imageUrl} alt="preview" className="object-cover w-full h-full" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="w-8 h-8 rounded-full"
                      onClick={(e) => { e.stopPropagation(); setCoverImage(i); }}
                      title="Set as cover"
                    >
                      <Star className={`w-4 h-4 ${img.isCover ? 'fill-emerald-500 text-emerald-500' : 'text-slate-600'}`} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="w-8 h-8 rounded-full"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {img.isCover && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold">Review & Submit</h2>
          <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm text-slate-500">Title</h3>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500">Location</h3>
              <p className="font-medium">{formData.fullAddress}, {formData.area}, {formData.city}</p>
            </div>
            <div>
              <h3 className="text-sm text-slate-500">Price</h3>
              <p className="font-medium">₦{Number(formData.priceNumeric).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
        <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
          Back
        </Button>
        {step < 5 ? (
          <Button onClick={() => setStep(s => Math.min(5, s + 1))} className="bg-emerald-700 hover:bg-emerald-800">
            Next Step
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-700 hover:bg-emerald-800">
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Listing' : 'Publish Listing')}
          </Button>
        )}
      </div>
    </div>
  );
}
