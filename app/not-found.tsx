import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">404 - Page Not Found</h2>
      <p className="text-slate-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
