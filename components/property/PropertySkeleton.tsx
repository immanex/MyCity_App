export default function PropertySkeleton() {
  return (
    <div className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden animate-pulse border border-slate-100">
      <div className="aspect-[4/3] bg-slate-100 relative">
        <div className="absolute bottom-3 left-3 right-3 h-14 bg-white/50 rounded-xl" />
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-3">
          <div className="h-7 bg-slate-100 rounded-lg w-3/4" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-4">
            <div className="h-4 w-10 bg-slate-100 rounded" />
            <div className="h-4 w-10 bg-slate-100 rounded" />
            <div className="h-4 w-10 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
