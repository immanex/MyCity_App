'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PendingAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents/pending');
      const data = await res.json();
      if (Array.isArray(data)) setAgents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agencyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAction = async (action: string, agentId: string, userId: string) => {
    if (action === 'REJECT' && !confirm('Are you sure you want to reject and delete this agent?')) return;

    try {
      const res = await fetch('/api/admin/agents/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, agentId, userId })
      });

      if (res.ok) {
        toast.success(`Agent ${action.toLowerCase()}d successfully`);
        setAgents(agents.filter(a => a.id !== agentId));
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
        <h1 className="text-3xl font-serif font-bold">Approve Agents</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents..."
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
              <th className="p-4 font-medium">Agent</th>
              <th className="p-4 font-medium">Agency</th>
              <th className="p-4 font-medium">Registered</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedAgents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No agents found.</td>
              </tr>
            ) : (
              paginatedAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{agent.user.fullName}</p>
                        <p className="text-xs text-slate-500">{agent.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{agent.agencyName || 'Independent'}</td>
                  <td className="p-4 text-sm text-slate-500">{new Date(agent.user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => handleAction('APPROVE', agent.id, agent.userId)} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction('REJECT', agent.id, agent.userId)} className="text-red-500 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-1" /> Reject
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length} agents
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
    </div>
  );
}
