import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X, Users, MessageSquare, Plus, Trash2, CheckCircle,
  Clock, Shield, User, AlertCircle, ChevronDown, ChevronUp,
  Eye, EyeOff
} from 'lucide-react';

export const AdminPanel = ({ onClose }) => {
  const { users, feedbacks, addUser, removeUser, resolveFeedback, deleteFeedback, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('feedbacks');
  const [showAddUser, setShowAddUser] = useState(false);
  const [expandedFb, setExpandedFb] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'user' });
  const [addError, setAddError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending');
  const resolvedFeedbacks = feedbacks.filter(f => f.status === 'resolved');

  const handleAddUser = (e) => {
    e.preventDefault();
    setAddError('');
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      setAddError('Barcha maydonlarni to\'ldiring');
      return;
    }
    const exists = users.find(u => u.username === newUser.username.trim());
    if (exists) {
      setAddError('Bu username allaqachon mavjud');
      return;
    }
    addUser({ ...newUser, username: newUser.username.trim(), name: newUser.name.trim() });
    setNewUser({ username: '', password: '', name: '', role: 'user' });
    setShowAddUser(false);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('uz-UZ', {
      timeZone: 'Asia/Tashkent',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-wrap">
            <Shield size={20} className="admin-panel-icon" />
            <h2 className="admin-panel-title">Admin Panel</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'feedbacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedbacks')}
          >
            <MessageSquare size={15} />
            Murojatlar
            {pendingFeedbacks.length > 0 && (
              <span className="admin-tab-badge">{pendingFeedbacks.length}</span>
            )}
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} />
            Foydalanuvchilar
            <span className="admin-tab-badge admin-tab-badge-blue">{users.length}</span>
          </button>
        </div>

        <div className="admin-panel-body">
          {activeTab === 'feedbacks' && (
            <div className="admin-feedbacks">
              {feedbacks.length === 0 ? (
                <div className="admin-empty">
                  <MessageSquare size={40} />
                  <p>Hozircha murojatlar yo'q</p>
                </div>
              ) : (
                <>
                  {pendingFeedbacks.length > 0 && (
                    <div className="admin-fb-section">
                      <h3 className="admin-section-title">
                        <Clock size={14} /> Kutilayotgan ({pendingFeedbacks.length})
                      </h3>
                      {pendingFeedbacks.map(fb => (
                        <div key={fb.id} className="admin-fb-card pending">
                          <div
                            className="admin-fb-header"
                            onClick={() => setExpandedFb(expandedFb === fb.id ? null : fb.id)}
                          >
                            <div className="admin-fb-meta">
                              <span className={`admin-fb-type-badge ${fb.type}`}>
                                {fb.type === 'feedback' ? <MessageSquare size={11} /> : <AlertCircle size={11} />}
                                {fb.type === 'feedback' ? 'Fikr' : 'Murojaat'}
                              </span>
                              <span className="admin-fb-user">👤 {fb.name} ({fb.username})</span>
                              <span className="admin-fb-time">{formatDate(fb.createdAt)}</span>
                            </div>
                            {expandedFb === fb.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          {expandedFb === fb.id && (
                            <div className="admin-fb-body">
                              <p className="admin-fb-message">{fb.message}</p>
                              <div className="admin-fb-actions">
                                <button
                                  className="admin-fb-resolve-btn"
                                  onClick={() => resolveFeedback(fb.id)}
                                >
                                  <CheckCircle size={14} />
                                  Tugatildi
                                </button>
                                <button
                                  className="admin-fb-delete-btn"
                                  onClick={() => deleteFeedback(fb.id)}
                                >
                                  <Trash2 size={14} />
                                  O'chirish
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {resolvedFeedbacks.length > 0 && (
                    <div className="admin-fb-section">
                      <h3 className="admin-section-title resolved-title">
                        <CheckCircle size={14} /> Tugatilgan ({resolvedFeedbacks.length})
                      </h3>
                      {resolvedFeedbacks.map(fb => (
                        <div key={fb.id} className="admin-fb-card resolved">
                          <div
                            className="admin-fb-header"
                            onClick={() => setExpandedFb(expandedFb === fb.id ? null : fb.id)}
                          >
                            <div className="admin-fb-meta">
                              <span className={`admin-fb-type-badge ${fb.type}`}>
                                {fb.type === 'feedback' ? <MessageSquare size={11} /> : <AlertCircle size={11} />}
                                {fb.type === 'feedback' ? 'Fikr' : 'Murojaat'}
                              </span>
                              <span className="admin-fb-user">👤 {fb.name} ({fb.username})</span>
                              <span className="admin-fb-time">{formatDate(fb.createdAt)}</span>
                            </div>
                            {expandedFb === fb.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          {expandedFb === fb.id && (
                            <div className="admin-fb-body">
                              <p className="admin-fb-message">{fb.message}</p>
                              <div className="admin-fb-actions">
                                <button
                                  className="admin-fb-delete-btn"
                                  onClick={() => deleteFeedback(fb.id)}
                                >
                                  <Trash2 size={14} />
                                  O'chirish
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-users">
              <div className="admin-users-header">
                <h3 className="admin-section-title">
                  <Users size={14} /> Foydalanuvchilar ro'yxati
                </h3>
                <button
                  className="admin-add-user-btn"
                  onClick={() => setShowAddUser(p => !p)}
                >
                  <Plus size={15} />
                  Yangi qo'shish
                </button>
              </div>

              {showAddUser && (
                <form className="admin-add-user-form" onSubmit={handleAddUser}>
                  <h4 className="admin-add-user-title">Yangi foydalanuvchi</h4>
                  <div className="admin-add-user-fields">
                    <input
                      className="admin-input"
                      placeholder="Ism familya"
                      value={newUser.name}
                      onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <input
                      className="admin-input"
                      placeholder="Username"
                      value={newUser.username}
                      onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                      required
                    />
                    <div className="admin-input-pass-wrap">
                      <input
                        className="admin-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Parol"
                        value={newUser.password}
                        onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                        required
                      />
                      <button type="button" className="admin-eye-btn" onClick={() => setShowPassword(p => !p)}>
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <select
                      className="admin-input admin-select"
                      value={newUser.role}
                      onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="user">Foydalanuvchi</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {addError && <p className="admin-add-error">{addError}</p>}
                  <div className="admin-add-user-actions">
                    <button type="button" className="admin-cancel-btn" onClick={() => setShowAddUser(false)}>
                      Bekor
                    </button>
                    <button type="submit" className="admin-save-btn">
                      <Plus size={14} />
                      Qo'shish
                    </button>
                  </div>
                </form>
              )}

              <div className="admin-user-list">
                {users.map(user => (
                  <div key={user.id} className="admin-user-card">
                    <div className="admin-user-avatar">
                      {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    <div className="admin-user-info">
                      <span className="admin-user-name">{user.name}</span>
                      <span className="admin-user-username">@{user.username}</span>
                    </div>
                    <span className={`admin-user-role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
                    </span>
                    {user.id !== currentUser.id && (
                      <button
                        className="admin-user-delete-btn"
                        onClick={() => removeUser(user.id)}
                        title="O'chirish"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};