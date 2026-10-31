import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const STATUS_BADGES = {
  new: { label: 'New', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  contacted: { label: 'Contacted', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  converted: { label: 'Converted', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  closed: { label: 'Closed', bg: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

export default function LeadManager() {
  const { token } = useAuth();
  const { API_BASE_URL } = useSettings();

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_BASE_URL}/leads?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
      setActionMessage({ type: 'error', text: 'Failed to fetch inquiries' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, statusFilter, searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistic update
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
        );
        setActionMessage({ type: 'success', text: `Lead marked as ${newStatus}` });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead inquiry?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        setActionMessage({ type: 'success', text: 'Inquiry deleted successfully' });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Delete lead error:', err);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* ── Top Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-wider">
              Customer Acquisition
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#1A384C]">
            Inquiries & Contact Leads
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            All inquiries submitted from the website contact form appear here with full customer details.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-semibold shadow-xs hover:bg-neutral-50 transition-all w-fit cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Leads
        </button>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Leads</p>
          <p className="text-2xl font-black text-[#1A384C] mt-1">{stats.total || leads.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">New Inquiries</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.new || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Contacted</p>
          <p className="text-2xl font-black text-sky-700 mt-1">{stats.contacted || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Converted Trips</p>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.converted || 0}</p>
        </div>
      </div>

      {/* Action alert toast */}
      {actionMessage.text && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'converted', label: 'Converted' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#1A384C] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-[#FF6B16] bg-[#F8FAFC]"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* ── Leads List Cards ── */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B16] mx-auto mb-2" />
          <p className="text-xs text-neutral-400">Loading incoming customer inquiries...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-700">No Inquiries Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            When users submit inquiries from the website contact page, they will automatically appear here with their contact details.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const statusConfig = STATUS_BADGES[lead.status] || STATUS_BADGES.new;
            const formattedDate = new Date(lead.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={lead._id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row: Name, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A384C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#111111]">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <p className="text-[11px] text-[#FF6B16] font-bold">
                          Group / Company: {lead.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${statusConfig.bg}`}
                      >
                        <option value="new">● New</option>
                        <option value="contacted">● Contacted</option>
                        <option value="converted">● Converted</option>
                        <option value="closed">● Closed</option>
                      </select>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Details row: Email, Phone, Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600 bg-[#F8FAFC] p-3 rounded-xl border border-neutral-200/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6B16] shrink-0" />
                    <a
                      href={`mailto:${lead.email}?subject=Regarding: ${lead.subject || 'Trip Inquiry'}`}
                      className="font-medium hover:text-[#FF6B16] truncate"
                    >
                      {lead.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF6B16] shrink-0" />
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="font-medium hover:text-[#FF6B16]">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-neutral-400 italic">No phone provided</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-800">Subject:</span>
                    <span className="truncate font-medium">{lead.subject || 'Trip Inquiry'}</span>
                  </div>
                </div>

                {/* Full Message content */}
                <div className="text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 leading-relaxed">
                  <p className="font-semibold text-neutral-900 mb-1 text-xs">Message / Inquiry Details:</p>
                  <p className="whitespace-pre-wrap">{lead.message}</p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {/* Quick Email Reply */}
                    <a
                      href={`mailto:${lead.email}?subject=Weekend Escapes Response: ${lead.subject || 'Your Travel Inquiry'}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 text-xs font-semibold hover:bg-neutral-50"
                    >
                      <Mail className="w-3 h-3 text-[#FF6B16]" />
                      Reply via Email
                    </a>

                    {/* Quick WhatsApp Link if phone is valid */}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20reaching%20out%20to%20Weekend%20Escapes!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
