'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Plus,
  Activity,
  Building,
  MapPin,
  DollarSign,
  X,
} from 'lucide-react';
import { Registration, AdminSession, AdminRole, RegistrationStatus } from '@/types';
import { EVENT_CONFIG } from '@/config/event.config';

interface Stats {
  total: number;
  today: number;
  confirmed: number;
  pending: number;
  colleges: number;
  states: number;
}

interface AdminDashboardClientProps {
  initialSession: AdminSession;
}

export default function AdminDashboardClient({ initialSession }: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'participants' | 'sheets' | 'users' | 'audit'>('participants');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    confirmed: 0,
    pending: 0,
    colleges: 0,
    states: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Detailed Views
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // User Management State (SUPER_ADMIN)
  const [admins, setAdmins] = useState<Omit<AdminSession, 'id'>[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('ADMIN');
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  const [directSaving, setDirectSaving] = useState(false);
  const [directSaveMsg, setDirectSaveMsg] = useState<string | null>(null);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '25',
        search: search.trim(),
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/registrations?${query.toString()}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setRegistrations(data.registrations);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, router]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Fetch admins if SUPER_ADMIN
  const fetchAdmins = useCallback(async () => {
    if (initialSession.role !== 'SUPER_ADMIN') return;
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error('Fetch admins error:', err);
    }
  }, [initialSession.role]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchAdmins();
    }
  }, [activeTab, fetchAdmins]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // Direct save to Windows Downloads folder
  const handleSaveToDownloads = async () => {
    setDirectSaving(true);
    setDirectSaveMsg(null);
    try {
      const res = await fetch('/api/admin/export', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDirectSaveMsg(data.message || 'Saved to Downloads folder!');
        setTimeout(() => setDirectSaveMsg(null), 8000);
      } else {
        alert(data.error || 'Failed to save export');
      }
    } catch {
      alert('Network error while saving file');
    } finally {
      setDirectSaving(false);
    }
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedReg && selectedReg.id === id) {
          setSelectedReg({ ...selectedReg, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Delete Registration
  const handleDeleteRegistration = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registrations?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirmId(null);
        if (selectedReg?.id === id) setSelectedReg(null);
        fetchRegistrations();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Trigger Google Sheets Sync
  const handleSyncSheets = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/sync-sheets', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(`✓ ${data.message}`);
        fetchRegistrations();
      } else {
        setSyncMessage(`Notice: ${data.error}`);
      }
    } catch {
      setSyncMessage('Failed to trigger synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  // Create New Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          username: newAdminUsername,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddAdminModal(false);
        setNewAdminEmail('');
        setNewAdminUsername('');
        setNewAdminPassword('');
        fetchAdmins();
      } else {
        setAdminActionError(data.error || 'Failed to create admin');
      }
    } catch {
      setAdminActionError('Network error while creating admin.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/40 flex items-center justify-center font-black text-white shadow-md">
            IL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide">ILLUMINATE Portal</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700/50 text-red-300">
                {initialSession.role}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">E-Cell, IIT Bombay Operations</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 mr-2">
            <span>Signed in as</span>
            <strong className="text-zinc-200">{initialSession.email}</strong>
          </div>

          <a
            href="/api/admin/export?format=xlsx"
            download="illuminate_registrations_2026.xlsx"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-green-950/80 hover:bg-green-900 border border-green-700/50 text-green-300 text-xs font-bold transition shadow-sm cursor-pointer"
            title="Download formatted Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </a>

          <a
            href="/api/admin/export?format=csv"
            download="illuminate_registrations_2026.csv"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-semibold transition cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <span>CSV</span>
          </a>

          <button
            onClick={handleSaveToDownloads}
            disabled={directSaving}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 text-blue-300 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Saves illuminate_registrations_2026.xlsx directly to your Windows Downloads folder"
          >
            {directSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{directSaving ? 'Saving...' : 'Save to PC Downloads'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-800 text-zinc-400 hover:text-red-400 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {directSaveMsg && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{directSaveMsg}</span>
            </div>
            <button
              onClick={() => setDirectSaveMsg(null)}
              className="text-emerald-400 hover:text-white text-xs p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Total Registrations</span>
              <Users className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-black text-white">{stats.total}</div>
            <span className="text-[11px] text-zinc-400">All recorded submissions</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Today&apos;s Signups</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.today}</div>
            <span className="text-[11px] text-emerald-400 font-medium">Recorded today</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Confirmed</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.confirmed}</div>
            <span className="text-[11px] text-green-400 font-medium">Ready for bootcamp</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>AKTU Students</span>
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.colleges}</div>
            <span className="text-[11px] text-zinc-400">Total enrolled</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>States</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.states}</div>
            <span className="text-[11px] text-zinc-400">Pan-India coverage</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Est. Workshop Value</span>
              <DollarSign className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white truncate">
              ₹{(stats.total * EVENT_CONFIG.participationFee).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-zinc-400">₹{EVENT_CONFIG.participationFee} / participant</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'participants'
                  ? 'bg-red-600 text-white red-glow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Participants ({stats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'sheets'
                  ? 'bg-red-600 text-white red-glow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets Sync</span>
            </button>

            {initialSession.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-red-600 text-white red-glow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Accounts</span>
              </button>
            )}
          </div>

          <button
            onClick={() => fetchRegistrations()}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
          </button>
        </div>

        {/* TAB 1: PARTICIPANTS TABLE */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone, roll no, ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <a
                  href="/api/admin/export?format=xlsx"
                  download="illuminate_registrations_2026.xlsx"
                  className="sm:hidden p-2 rounded-xl bg-green-900/60 hover:bg-green-800 border border-green-700 text-green-300 cursor-pointer"
                  title="Export Excel"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Participant</th>
                      <th className="px-5 py-3.5">AKTU Roll No. & Dept</th>
                      <th className="px-5 py-3.5">Location</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Registered</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-zinc-500">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            <span>Loading participants...</span>
                          </div>
                        </td>
                      </tr>
                    ) : registrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-zinc-500">
                          No participants found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-900/40 transition">
                          <td className="px-5 py-3.5 font-mono font-bold text-red-400 whitespace-nowrap">
                            {reg.registration_id}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white">{reg.full_name}</div>
                            <div className="text-[11px] text-zinc-400">{reg.email}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{reg.phone}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-zinc-200 font-medium font-mono">{reg.aktu_roll_no || reg.college}</div>
                            <div className="text-[11px] text-zinc-400">
                              {reg.department} • {reg.year_of_study}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            {reg.city}, {reg.state}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <select
                              value={reg.status}
                              onChange={(e) => handleStatusChange(reg.id, e.target.value as RegistrationStatus)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                reg.status === 'confirmed'
                                  ? 'bg-green-950/80 text-green-300 border-green-700/60'
                                  : reg.status === 'pending_payment'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                  : 'bg-red-950/80 text-red-300 border-red-700/60'
                              }`}
                            >
                              <option value="confirmed">CONFIRMED</option>
                              <option value="pending_payment">PENDING</option>
                              <option value="cancelled">CANCELLED</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap text-[11px]">
                            {new Date(reg.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedReg(reg)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {initialSession.role !== 'VIEWER' && (
                                <button
                                  onClick={() => setDeleteConfirmId(reg.id)}
                                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS SYNC */}
        {activeTab === 'sheets' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-950/80 border border-green-700/50 flex items-center justify-center text-green-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Google Sheets Synchronization Engine</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Synchronize confirmed attendees to your central master Google Sheet via Service Account API.
                </p>
              </div>
            </div>

            {syncMessage && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200">
                {syncMessage}
              </div>
            )}

            <div className="space-y-4 text-xs text-zinc-300">
              <p>
                When configured, new registrations are automatically streamed to Google Sheets in real-time. You can also trigger a bulk catch-up sync here at any time.
              </p>

              <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-2">
                <strong className="text-white block font-semibold">Environment Variables Required:</strong>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 font-mono text-[11px]">
                  <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                  <li>GOOGLE_PRIVATE_KEY</li>
                  <li>GOOGLE_SHEET_ID</li>
                </ul>
              </div>

              <button
                onClick={handleSyncSheets}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Synchronizing to Google Sheets...' : 'Trigger Google Sheets Sync Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN ACCOUNTS (SUPER_ADMIN ONLY) */}
        {activeTab === 'users' && initialSession.role === 'SUPER_ADMIN' && (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Administrative Accounts</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Manage operator credentials and roles.</p>
              </div>

              <button
                onClick={() => setShowAddAdminModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs red-glow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Admin User</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((adm, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-bold text-white">{adm.username}</td>
                      <td className="px-4 py-3 text-zinc-300">{adm.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60 text-red-300 text-[10px] font-bold">
                          {adm.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* PARTICIPANT DETAIL MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-zinc-950 shadow-2xl relative">
            <button
              onClick={() => setSelectedReg(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest font-mono">
                {selectedReg.registration_id}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">{selectedReg.full_name}</h3>
              <p className="text-xs text-zinc-400">{selectedReg.email} • {selectedReg.phone}</p>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 border-y border-white/10 py-5">
              <div>
                <span className="text-zinc-500 block">AKTU Roll No.</span>
                <strong className="text-white text-sm font-mono">{selectedReg.aktu_roll_no || selectedReg.college}</strong>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block">Department</span>
                  <span className="text-zinc-200">{selectedReg.department}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Year of Study</span>
                  <span className="text-zinc-200">{selectedReg.year_of_study}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block">Location</span>
                  <span className="text-zinc-200">{selectedReg.city}, {selectedReg.state}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Referral Code</span>
                  <span className="text-zinc-200 font-mono">{selectedReg.referral_code || 'None'}</span>
                </div>
              </div>

              {selectedReg.expectations && (
                <div>
                  <span className="text-zinc-500 block">Expectations & Ideas</span>
                  <p className="mt-1 p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-zinc-300 italic">
                    &ldquo;{selectedReg.expectations}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-[11px] text-zinc-500">
                Created: {new Date(selectedReg.created_at).toLocaleString('en-IN')}
              </div>

              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-red-800/40 bg-zinc-950 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Delete Participant?</h4>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove this record? This action will permanently delete the attendee from the registration roster.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRegistration(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold red-glow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMIN MODAL (SUPER_ADMIN) */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/20 bg-zinc-950 shadow-2xl relative">
            <button
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Create Admin Operator</h3>

            {adminActionError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-700 text-xs text-red-200">
                {adminActionError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Username</label>
                <input
                  type="text"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  required
                  placeholder="e.g. rachit_lead"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                  placeholder="e.g. operator@ecell.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Password (min 8 chars)</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Role</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                >
                  <option value="ADMIN">ADMIN (Full management & exports)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Can manage admins)</option>
                  <option value="VIEWER">VIEWER (Read-only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs red-glow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
