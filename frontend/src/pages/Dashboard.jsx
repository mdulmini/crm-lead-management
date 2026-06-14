import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, CheckCircle, XCircle, DollarSign, Star, AlertCircle, Send, Phone } from 'lucide-react';
import { STATUS_COLORS } from '../components/LeadForm';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </Layout>
  );

  const s = data?.stats || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your sales pipeline at a glance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={s.total_leads || 0} icon={Users} color="blue" />
          <StatCard label="New Leads" value={s.new_leads || 0} icon={Star} color="yellow" />
          <StatCard label="Qualified" value={s.qualified_leads || 0} icon={AlertCircle} color="purple" />
          <StatCard label="Proposal Sent" value={s.proposal_leads || 0} icon={Send} color="slate" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Contacted" value={s.contacted_leads || 0} icon={Phone} color="blue" />
          <StatCard label="Won" value={s.won_leads || 0} icon={CheckCircle} color="green" />
          <StatCard label="Lost" value={s.lost_leads || 0} icon={XCircle} color="red" />
          <StatCard label="Win Rate" value={s.total_leads ? `${Math.round((s.won_leads / s.total_leads) * 100)}%` : '0%'} icon={TrendingUp} color="green" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Total Pipeline Value" value={fmt(s.total_deal_value)} icon={DollarSign} color="blue" sub="All active deal values combined" />
          <StatCard label="Won Deal Value" value={fmt(s.won_deal_value)} icon={CheckCircle} color="green" sub="Revenue from closed deals" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Leads</h2>
              <Link to="/leads" className="text-sm text-blue-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {data?.recentLeads?.map(lead => (
                <Link key={lead.id} to={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600">{lead.lead_name}</p>
                    <p className="text-xs text-slate-500">{lead.company_name} · {lead.assigned_name || 'Unassigned'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                    <p className="text-xs text-slate-500 mt-1">{fmt(lead.deal_value)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Leads by Source</h2>
            <div className="space-y-3">
              {data?.bySource?.map(src => (
                <div key={src.lead_source} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-28">{src.lead_source}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(src.count / s.total_leads) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-6">{src.count}</span>
                </div>
              ))}
            </div>

            <h2 className="font-semibold text-slate-900 mb-3 mt-6">Salesperson Performance</h2>
            <div className="space-y-2">
              {data?.performance?.map(p => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{p.name}</span>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>{p.total} leads</span>
                    <span className="text-green-600 font-medium">{p.won} won</span>
                    <span className="text-blue-600 font-medium">{fmt(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}