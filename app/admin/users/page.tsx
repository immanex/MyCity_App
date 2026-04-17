'use client';

import { useState, useEffect } from 'react';
import { Trash2, ShieldAlert, Search, User as UserIcon } from 'lucide-react';
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

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const executeAction = async () => {
    if (!pendingAction) return;
    const { type, userId, newRole } = pendingAction;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: type === 'DELETE' ? 'DELETE' : 'CHANGE_ROLE', 
          targetUserId: userId, 
          role: newRole 
        })
      });

      if (res.ok) {
        toast.success(type === 'DELETE' ? 'User deleted' : `Role updated to ${newRole}`);
        if (type === 'DELETE') {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold">Manage Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
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
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => setPendingAction({ type: 'CHANGE_ROLE', userId: user.id, newRole: e.target.value, userEmail: user.email })}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border-2 border-transparent transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        user.role === 'AGENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      <option value="USER">User</option>
                      <option value="AGENT">Agent</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setPendingAction({ type: 'DELETE', userId: user.id, userEmail: user.email })} 
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">
              {pendingAction?.type === 'DELETE' ? 'Delete User' : 'Update User Role'}
            </DialogTitle>
            <DialogDescription>
              User: <span className="font-bold text-slate-900">{pendingAction?.userEmail}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {pendingAction?.type === 'DELETE' ? (
              <p className="text-slate-600">
                Are you sure you want to delete this user? This action is irreversible and will delete all associated properties, enquiries, and data.
              </p>
            ) : (
              <p className="text-slate-600">
                Are you sure you want to change this user's role to <span className="font-bold text-emerald-700">{pendingAction?.newRole}</span>?
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="ghost" onClick={() => setPendingAction(null)} className="flex-1 h-12 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={executeAction}
              className={`flex-1 h-12 rounded-xl text-white font-bold transition-all ${
                pendingAction?.type === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {pendingAction?.type === 'DELETE' ? 'Delete User' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
