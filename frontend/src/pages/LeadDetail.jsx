import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import LeadForm, { STATUS_COLORS, STATUSES } from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit, Trash2, X, MessageSquare, Mail, Phone, Building, Tag, User, DollarSign, Send } from 'lucide-react';
import toast from 'react-hot-toast';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = window.location.pathname.endsWith('/edit');

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    api.get(`/leads/${id}`).then(res => {
      setLead(res.data.lead);
      setNotes(res.data.notes);
      setLoading(false);
    });
  }, [id]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const res = await api.put(`/leads/${id}`, formData);
      setLead(res.data.lead);
      toast.success('Lead updated!');
      navigate(`/leads/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.patch(`/leads/${id}/status`, { status: newStatus });
      setLead(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status → ${newStatus}`);
    } catch {
      toast.error('Status update failed.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this lead? All notes will be removed.')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted.');
      navigate('/leads');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const res = await api.post('/notes', { lead_id: id, content: noteContent });
      setNotes(prev => [res.data.note, ...prev]);
      setNoteContent('');
      toast.success('Note added.');
    } catch {
      toast.error('Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </Layout>
  );

  if (!lead) return (
    <Layout>
      <div className="text-center py-16">
        <p className="text-slate-500">Lead not found.</p>
        <Link to="/leads" className="btn-primary mt-4 inline-flex">Back to Leads</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/leads" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{lead.lead_name}</h1>
              <p className="text-sm text-slate-500">{lead.company_name}</p>
            </div>
          </div>
          {!isEdit && (
            <div className="flex items-center gap-2">
              <Link to={`/leads/${id}/edit`} className="btn-secondary text-sm">
                <Edit className="h-4 w-4" /> Edit
              </Link>
              <button onClick={handleDelete} className="btn-danger text-sm">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {isEdit ? (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">Edit Lead</h2>
              <Link to={`/leads/${id}`} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </Link>
            </div>
            <LeadForm initial={lead} onSubmit={handleUpdate} onCancel={() => navigate(`/leads/${id}`)} loading={saving} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Lead Info</h2>
                  <span className={`badge ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                </div>
                <div className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={lead.email} />
                  <InfoRow icon={Phone} label="Phone" value={lead.phone} />
                  <InfoRow icon={Building} label="Company" value={lead.company_name} />
                  <InfoRow icon={Tag} label="Source" value={lead.lead_source} />
                  <InfoRow icon={User} label="Assigned To" value={lead.assigned_name || 'Unassigned'} />
                  <InfoRow icon={DollarSign} label="Deal Value" value={fmt(lead.deal_value)} />
                </div>
                <div className="border-t border-slate-100 mt-4 pt-4 text-xs text-slate-400 space-y-1">
                  <p>Created: {fmtDate(lead.created_at)}</p>
                  <p>Updated: {fmtDate(lead.updated_at)}</p>
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-slate-900 mb-3">Update Status</h2>
                <div className="space-y-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)}
                      disabled={lead.status === s || statusLoading}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${lead.status === s
                          ? `${STATUS_COLORS[s]} cursor-default`
                          : 'text-slate-600 hover:bg-slate-50 border border-slate-100'}`}>
                      {lead.status === s ? '✓ ' : ''}{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-5">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  <h2 className="font-semibold text-slate-900">Notes ({notes.length})</h2>
                </div>

                <form onSubmit={handleAddNote} className="mb-5">
                  <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                    className="input-field resize-none" rows={3}
                    placeholder="Add a note — call summary, email update, next steps..." />
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="btn-primary text-sm"
                      disabled={addingNote || !noteContent.trim()}>
                      <Send className="h-3.5 w-3.5" />
                      {addingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </form>

                {notes.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No notes yet. Add one above.</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {note.created_by_name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-600">{note.created_by_name}</span>
                            <span className="text-xs text-slate-400">{fmtDate(note.created_at)}</span>
                          </div>
                          {(note.created_by === user?.id || user?.role === 'admin') && (
                            <button onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}