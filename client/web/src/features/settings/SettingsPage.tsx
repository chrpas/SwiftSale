import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Users, Package, Ruler, Plus, Pencil, Trash2,
  ToggleLeft, ToggleRight, Key, X, Check, Loader2, ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  usersService, unitsService, categoriesService,
  getErrorMessage, UserDto, UnitOfMeasure
} from '../../services/api';
import { Category } from '../../types';


type Tab = 'users' | 'units' | 'categories';

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

/* ──────────────────────────── Main Page ──────────────────────────────── */
export const SettingsPage: React.FC = () => {
  const { isAdmin, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('units');

  const tabs = [
    { id: 'units' as Tab, label: 'Units of Measure', icon: Ruler, adminOnly: false },
    { id: 'categories' as Tab, label: 'Categories', icon: Package, adminOnly: false },
    { id: 'users' as Tab, label: 'User Management', icon: Users, adminOnly: true },
  ].filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Settings className="inline-block w-6 h-6 mr-2 text-indigo-400" />Settings</h1>
          <p className="page-subtitle">Configure your SwiftSale system</p>
        </div>

        {/* User Info */}
        <div className="settings-user-info">
          <div className="user-avatar user-avatar-md">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{user?.fullName}</p>
            <div className="flex items-center gap-1">
              {isAdmin
                ? <><ShieldCheck className="w-3 h-3 text-indigo-400" /><span className="text-xs text-indigo-400">Admin</span></>
                : <><UserIcon className="w-3 h-3 text-green-400" /><span className="text-xs text-green-400">Cashier</span></>}
            </div>
          </div>
          <button id="btn-logout" className="btn-ghost btn-sm ml-4" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
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
      </div>
    </div>
  );
};
