import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event', 'Other'];

const STATUS_COLORS = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Qualified: 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-orange-100 text-orange-700',
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
};

export { STATUS_COLORS, STATUSES, SOURCES };

export default function LeadForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    lead_name: initial.lead_name || '',
    company_name: initial.company_name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    lead_source: initial.lead_source || 'Website',
    assigned_to: initial.assigned_to || '',
    status: initial.status || 'New',
    deal_value: initial.deal_value || '',
  });

  useEffect(() => {
    api.get('/auth/users').then(res => setUsers(res.data.users));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ ...form, deal_value: parseFloat(form.deal_value) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lead Name *</label>
          <input name="lead_name" value={form.lead_name} onChange={handleChange}
            className="input-field" placeholder="John Smith" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input name="company_name" value={form.company_name} onChange={handleChange}
            className="input-field" placeholder="Acme Corp" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="input-field" placeholder="john@acme.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            className="input-field" placeholder="+1-555-0100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
          <select name="lead_source" value={form.lead_source} onChange={handleChange} className="input-field">
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
          <select name="assigned_to" value={form.assigned_to} onChange={handleChange} className="input-field">
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deal Value ($)</label>
          <input name="deal_value" type="number" value={form.deal_value} onChange={handleChange}
            className="input-field" placeholder="0.00" min="0" step="0.01" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
}