import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import LeadForm, { STATUS_COLORS, STATUSES, SOURCES } from '../components/LeadForm';
import { Plus, Search, Trash2, Edit, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', source: '', assigned_to: '', search: '' });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try {
      const res = await api.get(`/leads?${params}`);
      setLeads(res.data.leads);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { api.get('/auth/users').then(r => setUsers(r.data.users)); }, []);

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await api.post('/leads', formData);
      toast.success('Lead created!');
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete lead "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted.');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead.');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-500 text-sm mt-1">{leads.length} lead{leads.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold">New Lead</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6">
                <LeadForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
              </div>
            </div>
          </div>
        )}

        <div className="card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input placeholder="Search name, company, email..."
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                className="input-field pl-9" />
            </div>
            <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="input-field">
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filters.source} onChange={e => setFilters(p => ({ ...p, source: e.target.value }))} className="input-field">
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filters.assigned_to} onChange={e => setFilters(p => ({ ...p, assigned_to: e.target.value }))} className="input-field">
              <option value="">All Salespeople</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ status: '', source: '', assigned_to: '', search: '' })}
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">No leads found. Try adjusting your filters.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 mx-auto">
                <Plus className="h-4 w-4" /> Add First Lead
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-medium text-slate-600">Lead</th>
                    <th className="px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Source</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Assigned To</th>
                    <th className="px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Deal Value</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/leads/${lead.id}`} className="hover:text-blue-600">
                          <p className="font-medium text-slate-900">{lead.lead_name}</p>
                          <p className="text-xs text-slate-400">{lead.company_name} · {lead.email}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-slate-500">{lead.lead_source}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-500">{lead.assigned_name || '—'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell font-medium text-slate-700">{fmt(lead.deal_value)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link to={`/leads/${lead.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link to={`/leads/${lead.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDelete(lead.id, lead.lead_name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}