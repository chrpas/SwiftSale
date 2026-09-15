import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Users, Package, Ruler, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Key, X, Check, Loader2, ShieldCheck,
  User as UserIcon, Globe, Copy, QrCode, Wifi, WifiOff, AlertTriangle, CheckCircle2, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  usersService, unitsService, categoriesService, remoteAccessService,
  getErrorMessage, UserDto, UnitOfMeasure
} from '../../services/api';
import {
  Category, RemoteAccessStatus, RemoteAccessSettings, RemoteAccessStatusState
} from '../../types';


type Tab = 'users' | 'units' | 'categories' | 'remote-access';

/* ────────────────────────────── helpers ──────────────────────────────── */
const Badge: React.FC<{ label: string; variant: 'success' | 'warning' | 'info' }> = ({ label, variant }) => {
  const cls = {
    success: 'badge-success',
    warning: 'badge-warning',
    info: 'badge-info',
  }[variant];
  return <span className={`badge ${cls}`}>{label}</span>;
};

/* ─────────────────────────────── Users Tab ───────────────────────────── */
const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserDto | null>(null);
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'Cashier' });
  const [resetPassword, setResetPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setUsers(await usersService.getAll());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await usersService.create(form);
      setShowModal(false);
      setForm({ username: '', fullName: '', password: '', role: 'Cashier' });
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserDto) => {
    try {
      await usersService.update(u.id, { isActive: !u.isActive });
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setSaving(true);
    setError(null);
    try {
      await usersService.resetPassword(resetTarget.id, resetPassword);
      setResetTarget(null);
      setResetPassword('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3 className="settings-tab-title">User Accounts</h3>
        <button id="btn-add-user" className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="user-avatar">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">@{u.username}</td>
                  <td>
                    <Badge label={u.role} variant={u.role === 'Admin' ? 'info' : 'success'} />
                  </td>
                  <td>
                    <Badge label={u.isActive ? 'Active' : 'Inactive'} variant={u.isActive ? 'success' : 'warning'} />
                  </td>
                  <td className="text-slate-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString('en-PH')}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`btn-toggle-user-${u.id}`}
                        className="icon-btn"
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-400" />
                          : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                      </button>
                      <button
                        id={`btn-reset-pw-${u.id}`}
                        className="icon-btn"
                        title="Reset Password"
                        onClick={() => { setResetTarget(u); setResetPassword(''); }}
                      >
                        <Key className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New User</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body space-y-4">
              {error && <div className="alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" required value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Juan dela Cruz" />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" required value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. jdelacruz" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="btn-create-user-submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password — {resetTarget.fullName}</h3>
              <button className="icon-btn" onClick={() => setResetTarget(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleResetPassword} className="modal-body space-y-4">
              {error && <div className="alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)} placeholder="Enter new password" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setResetTarget(null)}>Cancel</button>
                <button type="submit" id="btn-reset-pw-submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────── Units Tab ────────────────────────────── */
const UnitsTab: React.FC = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState({ name: '', abbreviation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setUnits(await unitsService.getAll());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', abbreviation: '' }); setShowModal(true); };
  const openEdit = (u: UnitOfMeasure) => { setEditing(u); setForm({ name: u.name, abbreviation: u.abbreviation }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await unitsService.update(editing.id, form);
      } else {
        await unitsService.create(form);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this unit of measure?')) return;
    try {
      await unitsService.delete(id);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3 className="settings-tab-title">Units of Measure</h3>
        <button id="btn-add-unit" className="btn-primary btn-sm" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="settings-grid">
          {units.map((u) => (
            <div key={u.id} className="unit-card">
              <div>
                <p className="font-semibold text-white">{u.name}</p>
                <p className="text-slate-400 text-sm">{u.abbreviation}</p>
              </div>
              <div className="flex gap-2">
                <button id={`btn-edit-unit-${u.id}`} className="icon-btn" onClick={() => openEdit(u)}>
                  <Pencil className="w-4 h-4 text-indigo-400" />
                </button>
                <button id={`btn-delete-unit-${u.id}`} className="icon-btn" onClick={() => handleDelete(u.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Unit' : 'Add Unit of Measure'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body space-y-4">
              {error && <div className="alert-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kilogram" />
              </div>
              <div className="form-group">
                <label className="form-label">Abbreviation</label>
                <input className="form-input" required value={form.abbreviation}
                  onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} placeholder="e.g. Kg" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="btn-save-unit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editing ? 'Save Changes' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── Categories Tab ─────────────────────────── */
const CategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesService.getAll()
      .then(setCategories)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3 className="settings-tab-title">Product Categories</h3>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <div className="loading-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="settings-grid">
          {categories.map((c) => (
            <div key={c.id} className="unit-card">
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-slate-400 text-sm">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────── Remote Access Tab ────────────────────── */
const RemoteAccessTab: React.FC = () => {
  const [status, setStatus] = useState<RemoteAccessStatus | null>(null);
  const [settings, setSettings] = useState<RemoteAccessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [ngrokPath, setNgrokPath] = useState('');
  const [authtoken, setAuthtoken] = useState('');
  const [autoStart, setAutoStart] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, settingsRes] = await Promise.all([
        remoteAccessService.getStatus(),
        remoteAccessService.getSettings(),
      ]);
      setStatus(statusRes);
      setSettings(settingsRes);
      setNgrokPath(settingsRes.ngrokPath);
      setAutoStart(settingsRes.autoStart);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      try {
        const [statusRes, settingsRes] = await Promise.all([
          remoteAccessService.getStatus(),
          remoteAccessService.getSettings(),
        ]);
        setStatus(statusRes);
        setSettings(settingsRes);
      } catch (e) {
        // ignore polling error
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setError(null);
      const updated = await remoteAccessService.updateSettings({
        ngrokPath: ngrokPath.trim() || undefined,
        authtoken: authtoken.trim() || undefined,
        autoStart,
      });
      setSettings(updated);
      setAuthtoken('');
      const newStatus = await remoteAccessService.getStatus();
      setStatus(newStatus);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStart = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const st = await remoteAccessService.start();
      setStatus(st);
      if (st.errorMessage) {
        setError(st.errorMessage);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const st = await remoteAccessService.stop();
      setStatus(st);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-[#6B8F7A]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Remote Access settings...</span>
      </div>
    );
  }

  const rawState = String(status?.state ?? '');
  const isRunning = rawState === 'Running' || rawState === '2' || status?.state === RemoteAccessStatusState.Running;
  const isStarting = rawState === 'Starting' || rawState === '1' || status?.state === RemoteAccessStatusState.Starting;

  return (
    <div className="space-y-6 p-2">
      {/* Security Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-amber-900">Security Notice: Remote Access</p>
          <p>
            Remote access exposes your local SwiftSale application to the Internet using an ngrok HTTPS tunnel.
            Authentication and administrator authorization rules remain strictly enforced. Only enable when required.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tunnel Status & Control Card */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1ECE5] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1ECE5] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRunning ? 'bg-emerald-500/15 text-[#0D7A5F]' : 'bg-[#F2F7F4] text-[#6B8F7A]'}`}>
              {isRunning ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1D3530]">Remote Access Tunnel</h3>
              <p className="text-xs text-[#6B8F7A]">
                Local Address: <span className="font-mono font-semibold text-[#1D3530]">{status?.localAddress || 'http://localhost:5126'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isRunning
                ? 'bg-emerald-500/15 text-[#0D7A5F] border border-emerald-500/30'
                : isStarting
                ? 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/30'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#0D7A5F] animate-pulse' : isStarting ? 'bg-indigo-600 animate-ping' : 'bg-slate-400'}`} />
              {isRunning ? 'RUNNING' : isStarting ? 'STARTING...' : 'DISABLED'}
            </span>

            {isRunning ? (
              <button
                type="button"
                onClick={handleStop}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>Stop Tunnel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0B654E] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>Start Remote Access</span>
              </button>
            )}
          </div>
        </div>

        {/* Public URL Box (When Running) */}
        {isRunning && status?.publicUrl && (
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#0D7A5F]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D7A5F] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                Active Public HTTPS URL
              </span>
              {status.startedAt && (
                <span className="text-[11px] text-[#6B8F7A]">
                  Started at: {new Date(status.startedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={status.publicUrl}
                className="flex-1 py-2 px-3 rounded-lg border border-[#0D7A5F]/40 bg-white font-mono text-sm text-[#0D7A5F] font-bold focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(status.publicUrl!)}
                  className="py-2 px-3 rounded-lg bg-[#0D7A5F] hover:bg-[#0B654E] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="py-2 px-3 rounded-lg border border-[#0D7A5F]/40 bg-white text-[#0D7A5F] hover:bg-[#F2F7F4] font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>

                <a
                  href={status.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-lg border border-[#0D7A5F]/40 bg-white text-[#0D7A5F] hover:bg-[#F2F7F4] font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ngrok Configuration Form */}
      <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1ECE5] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E1ECE5] pb-3">
          <h3 className="font-bold text-base text-[#1D3530]">ngrok Configuration</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
            settings?.isNgrokDetected ? 'bg-emerald-500/10 text-[#0D7A5F]' : 'bg-rose-500/10 text-rose-600'
          }`}>
            {settings?.isNgrokDetected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ngrok Detected ({settings.ngrokVersion || 'Installed'})</span>
              </>
            ) : (
              <>
                <X className="w-3.5 h-3.5" />
                <span>ngrok Not Found</span>
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#3D5A50] block mb-1">
              ngrok Executable Path
            </label>
            <input
              type="text"
              value={ngrokPath}
              onChange={(e) => setNgrokPath(e.target.value)}
              placeholder="e.g. C:\Program Files\ngrok\ngrok.exe or ngrok"
              className="w-full py-2 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] font-mono focus:outline-none focus:border-[#0D7A5F]"
            />
            <p className="text-[10px] text-[#6B8F7A] mt-1">
              Leave as <code className="bg-slate-100 px-1 rounded">ngrok</code> if available in system PATH.
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#3D5A50] block mb-1">
              ngrok Authtoken
            </label>
            <input
              type="password"
              value={authtoken}
              onChange={(e) => setAuthtoken(e.target.value)}
              placeholder={settings?.hasAuthtoken ? '•••••••••••••••• (Configured)' : 'Enter ngrok authtoken'}
              className="w-full py-2 px-3 rounded-xl border border-[#E1ECE5] bg-[#F2F7F4] text-[#1D3530] font-mono focus:outline-none focus:border-[#0D7A5F]"
            />
            <p className="text-[10px] text-[#6B8F7A] mt-1">
              Get your authtoken from <a href="https://dashboard.ngrok.com/get-started/your-authtoken" target="_blank" rel="noreferrer" className="text-[#0D7A5F] underline">ngrok Dashboard</a>. Token is never shown plain.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E1ECE5]">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1D3530]">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="w-4 h-4 rounded border-[#E1ECE5] text-[#0D7A5F] focus:ring-[#0D7A5F]"
            />
            <span>Start Remote Access Automatically on SwiftSale Startup</span>
          </label>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-4 py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0B654E] text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* QR Code Modal */}
      {showQrModal && status?.publicUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#E1ECE5] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#E1ECE5] pb-3">
              <h3 className="font-bold text-base text-[#1D3530] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#0D7A5F]" />
                <span>Remote Access QR Code</span>
              </h3>
              <button type="button" onClick={() => setShowQrModal(false)} className="p-1 text-[#6B8F7A] hover:text-[#1D3530]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F2F7F4] rounded-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(status.publicUrl)}&size=200x200`}
                alt="Remote Access QR Code"
                className="w-48 h-48 rounded-lg border border-[#E1ECE5] shadow-sm"
              />
            </div>

            <p className="text-xs text-[#6B8F7A] font-mono break-all">
              {status.publicUrl}
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-[#0D7A5F] hover:bg-[#0B654E] text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── Main Page ──────────────────────────────── */
export const SettingsPage: React.FC = () => {
  const { isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, label: 'Users & Roles', icon: Users, adminOnly: true },
    { id: 'units' as Tab, label: 'Units of Measure', icon: Ruler, adminOnly: false },
    { id: 'categories' as Tab, label: 'Categories', icon: Package, adminOnly: false },
    { id: 'remote-access' as Tab, label: 'Remote Access', icon: Globe, adminOnly: true },
  ].filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D3530] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0D7A5F]" />
            Settings
          </h1>
          <p className="text-sm text-[#6B8F7A] mt-0.5">
            Configure application preferences, master data, and user permissions
          </p>
        </div>

        {/* User Info */}
        <div className="settings-user-info">
          <div className="user-avatar user-avatar-md">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#1D3530] text-sm">{user?.fullName}</p>
            <div className="flex items-center gap-1">
              {isAdmin
                ? <><ShieldCheck className="w-3 h-3 text-[#0D7A5F]" /><span className="text-xs text-[#0D7A5F]">Admin</span></>
                : <><UserIcon className="w-3 h-3 text-[#059669]" /><span className="text-xs text-[#059669]">Cashier</span></>}
            </div>
          </div>
          <button id="btn-logout" className="btn-ghost btn-sm ml-4" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            className={`settings-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card mt-4">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'units' && <UnitsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'remote-access' && <RemoteAccessTab />}
      </div>
    </div>
  );
};
