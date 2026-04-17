'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Trash2, ExternalLink, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => 
    report.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAction = async (action: string, reportId: string, propertyId: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reportId, propertyId })
      });

      if (res.ok) {
        toast.success(`Action successful`);
        if (action === 'REMOVE_PROPERTY') {
          setReports(reports.filter(r => r.propertyId !== propertyId));
        } else {
          setReports(reports.filter(r => r.id !== reportId));
        }
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold">Property Reports</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-11 rounded-xl border border-slate-200 w-full md:w-64 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-4 font-medium">Property</th>
              <th className="p-4 font-medium">Reported By</th>
              <th className="p-4 font-medium">Reason</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No reports found.</td>
              </tr>
            ) : (
              paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{report.property?.title || 'Unknown'}</span>
                      {report.property && (
                        <Link href={`/properties/${report.propertyId}`} target="_blank" className="text-emerald-600 hover:text-emerald-700">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{report.user.email}</td>
                  <td className="p-4">
                    <p className="font-medium text-sm text-red-600">{report.reason}</p>
                    {report.description && <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{report.description}</p>}
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)} className="text-blue-600 hover:bg-blue-50">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Warn User
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction('DISMISS', report.id, report.propertyId)} className="text-slate-600 border-slate-200 hover:bg-slate-100">
                        <CheckCircle className="w-4 h-4 mr-1" /> Dismiss
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction('REMOVE_PROPERTY', report.id, report.propertyId)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete Property
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} reports
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Warn User Modal placeholder */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              Warn Property Agent
            </DialogTitle>
            <DialogDescription>
              This listing for "{selectedReport?.property?.title}" was reported for <strong>{selectedReport?.reason}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              This action will send a formal warning to the agent ({selectedReport?.property?.agent?.email}) and mark the report as REVIEWED.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Warning Message</label>
              <textarea 
                className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 transition-all font-medium text-slate-900 resize-none"
                placeholder="Agent, your listing has been reported..."
                defaultValue={`Dear Agent, your listing "${selectedReport?.property?.title}" has been reported for: ${selectedReport?.reason}. Please review and update it to avoid removal.`}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="ghost" onClick={() => setSelectedReport(null)} className="flex-1 h-12 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                handleAction('DISMISS', selectedReport.id, selectedReport.propertyId);
                setSelectedReport(null);
                toast.success('Warning sent (Simulation)');
              }}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
