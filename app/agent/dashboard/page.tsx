'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Eye, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!stats || stats.error) {
    return <div className="p-8 text-red-500">Failed to load stats.</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-serif font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Listings</CardTitle>
            <Home className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Leads</CardTitle>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views Over Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {stats.viewsPerDay && stats.viewsPerDay.length > 0 && stats.viewsPerDay.some((d: any) => d.views > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.viewsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleDateString()} />
                  <Line type="monotone" dataKey="views" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No views yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
