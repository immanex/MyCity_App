'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function SortableItem({ id, property }: { id: string, property: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-2">
      <div {...attributes} {...listeners} className="cursor-grab p-2 text-slate-400 hover:text-slate-600">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
        {property.images?.[0]?.imageUrl && (
          <img src={property.images[0].imageUrl} alt="cover" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-900">{property.title}</h3>
        <p className="text-sm text-slate-500">{property.priceDisplay} • {property.area}</p>
      </div>
    </div>
  );
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/featured');
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProperties((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveOrder = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: properties.map(p => p.id) })
      });

      if (res.ok) {
        toast.success('Order saved successfully');
      } else {
        toast.error('Failed to save order');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">Featured Properties</h1>
        <Button onClick={saveOrder} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
          {isSaving ? 'Saving...' : 'Save Order'}
        </Button>
      </div>

      <p className="text-slate-500">Drag and drop to reorder the properties shown in the home page carousel.</p>

      {properties.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No featured properties.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={properties.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {properties.map(property => (
              <SortableItem key={property.id} id={property.id} property={property} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
