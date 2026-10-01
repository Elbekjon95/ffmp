import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkPasswordCriteria, generateStrongPassword } from '../../utils/passwordPolicy';
import {
  X, Users, MessageSquare, Plus, Trash2, CheckCircle,
  Clock, Shield, User, AlertCircle, ChevronDown, ChevronUp,
  Eye, EyeOff, KeyRound, Sparkles, Check, Lock
} from 'lucide-react';

export const AdminPanel = ({ onClose }) => {
  const {
    users,
    feedbacks,
    addUser,
    removeUser,
    resolveFeedback,
    deleteFeedback,
    changePassword,
    resetUserPassword,
    currentUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' | 'users' | 'security'
  const [showAddUser, setShowAddUser] = useState(false);
  const [expandedFb, setExpandedFb] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'user' });
  const [addError, setAddError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parol o'zgartirish holatlari (Xavfsizlik bo'limi)
  const [secForm, setSecForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [secShowCurr, setSecShowCurr] = useState(false);
  const [secShowNew, setSecShowNew] = useState(false);
  const [secStatus, setSecStatus] = useState({ loading: false, error: '', success: '' });

  // Foydalanuvchi parolini admin tomonidan yangilash
  const [resetModalUser, setResetModalUser] = useState(null); // user object
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetShowPwd, setResetShowPwd] = useState(false);
  const [resetStatus, setResetStatus] = useState({ loading: false, error: '', success: '' });

  const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending');
  const resolvedFeedbacks = feedbacks.filter(f => f.status === 'resolved');

  // Yangi foydalanuvchi paroli uchun kriteriyalar
  const newUserPolicy = checkPasswordCriteria(newUser.password);
  // Admin o'z parolini o'zgartirish kriteriyalari
  const secPolicy = checkPasswordCriteria(secForm.newPassword);
  // Reset qilish kriteriyalari
  const resetPolicy = checkPasswordCriteria(resetNewPassword);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      setAddError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (!newUserPolicy.isValid) {
      setAddError("Parol xavfsizlik talablariga javob bermaydi (Katta harf, kichik harf, raqam va maxsus belgi bo'lishi shart)");
      return;
    }

    const exists = users.find(u => u.username === newUser.username.trim());
    if (exists) {
      setAddError('Bu username allaqachon mavjud');
      return;
    }

    const res = await addUser({
      ...newUser,
      username: newUser.username.trim(),
      name: newUser.name.trim()
    });

    if (res && !res.success) {
      setAddError(res.error || "Foydalanuvchi qo'shishda xatolik yuz berdi");
      return;
    }

    setNewUser({ username: '', password: '', name: '', role: 'user' });
    setShowAddUser(false);
  };

  const handleChangeMyPassword = async (e) => {
    e.preventDefault();
    setSecStatus({ loading: true, error: '', success: '' });

    if (!secForm.currentPassword) {
      setSecStatus({ loading: false, error: 'Joriy parolni kiriting', success: '' });
      return;
    }

    if (!secPolicy.isValid) {
      setSecStatus({
        loading: false,
        error: "Yangi parol kuchli bo'lishi shart: 8+ belgi, katta harf, kichik harf, raqam va maxsus simvol.",
        success: ''
      });
      return;
    }

    if (secForm.newPassword !== secForm.confirmPassword) {
      setSecStatus({ loading: false, error: 'Yangi parollar mos kelmadi', success: '' });
      return;
    }

    const res = await changePassword(secForm.currentPassword, secForm.newPassword);
    if (res.success) {
      setSecStatus({ loading: false, error: '', success: 'Parol muvaffaqiyatli yangilandi!' });
      setSecForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setSecStatus({ loading: false, error: res.error || "Xatolik yuz berdi", success: '' });
    }
  };

  const handleResetUserPassword = async (e) => {
    e.preventDefault();
    setResetStatus({ loading: true, error: '', success: '' });

    if (!resetPolicy.isValid) {
      setResetStatus({
        loading: false,
        error: "Parol kuchli bo'lishi shart: 8+ belgi, katta harf, kichik harf, raqam va maxsus simvol.",
        success: ''
      });
      return;
    }

    const res = await resetUserPassword(resetModalUser.id || resetModalUser._id, resetNewPassword);
    if (res.success) {
      setResetStatus({ loading: false, error: '', success: 'Foydalanuvchi paroli yangilandi!' });
      setTimeout(() => {
        setResetModalUser(null);
        setResetNewPassword('');
        setResetStatus({ loading: false, error: '', success: '' });
      }, 1500);
    } else {
      setResetStatus({ loading: false, error: res.error || "Xatolik yuz berdi", success: '' });
    }
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
            <h2 className="admin-panel-title">Admin Boshqaruv Paneli</h2>
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
            Murojaatlar
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
          <button
            className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={15} />
            Xavfsizlik & Parol
          </button>
        </div>

        <div className="admin-panel-body">
          {/* TAB 1: MUROJAATLAR */}
          {activeTab === 'feedbacks' && (
            <div className="admin-feedbacks">
              {feedbacks.length === 0 ? (
                <div className="admin-empty">
                  <MessageSquare size={40} />
                  <p>Hozircha murojaatlar yo'q</p>
                </div>
              ) : (
                <>
                  {pendingFeedbacks.length > 0 && (
                    <div className="admin-fb-section">
                      <h3 className="admin-section-title">
                        <Clock size={14} /> Kutilayotgan ({pendingFeedbacks.length})
                      </h3>
                      {pendingFeedbacks.map(fb => (
                        <div key={fb._id} className="admin-fb-card pending">
                          <div
                            className="admin-fb-header"
                            onClick={() => setExpandedFb(expandedFb === fb._id ? null : fb._id)}
                          >
                            <div className="admin-fb-meta">
                              <span className={`admin-fb-type-badge ${fb.type}`}>
                                {fb.type === 'feedback' ? <MessageSquare size={11} /> : <AlertCircle size={11} />}
                                {fb.type === 'feedback' ? 'Fikr' : 'Murojaat'}
                              </span>
                              <span className="admin-fb-user">👤 {fb.name} ({fb.username})</span>
                              <span className="admin-fb-time">{formatDate(fb.createdAt)}</span>
                            </div>
                            {expandedFb === fb._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          {expandedFb === fb._id && (
                            <div className="admin-fb-body">
                              <p className="admin-fb-message">{fb.message}</p>
                              <div className="admin-fb-actions">
                                <button
                                  className="admin-fb-resolve-btn"
                                  onClick={() => resolveFeedback(fb._id)}
                                >
                                  <CheckCircle size={14} />
                                  Bajarildi
                                </button>
                                <button
                                  className="admin-fb-delete-btn"
                                  onClick={() => deleteFeedback(fb._id)}
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
                      <h3 className="admin-section-title">
                        <CheckCircle size={14} /> Bajarilgan ({resolvedFeedbacks.length})
                      </h3>
                      {resolvedFeedbacks.map(fb => (
                        <div key={fb._id} className="admin-fb-card resolved">
                          <div
                            className="admin-fb-header"
                            onClick={() => setExpandedFb(expandedFb === fb._id ? null : fb._id)}
                          >
                            <div className="admin-fb-meta">
                              <span className={`admin-fb-type-badge ${fb.type}`}>
                                {fb.type === 'feedback' ? <MessageSquare size={11} /> : <AlertCircle size={11} />}
                                {fb.type === 'feedback' ? 'Fikr' : 'Murojaat'}
                              </span>
                              <span className="admin-fb-user">👤 {fb.name} ({fb.username})</span>
                              <span className="admin-fb-time">{formatDate(fb.createdAt)}</span>
                            </div>
                            {expandedFb === fb._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          {expandedFb === fb._id && (
                            <div className="admin-fb-body">
                              <p className="admin-fb-message">{fb.message}</p>
                              <div className="admin-fb-actions">
                                <button
                                  className="admin-fb-delete-btn"
                                  onClick={() => deleteFeedback(fb._id)}
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

          {/* TAB 2: FOYDALANUVCHILAR */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 className="admin-add-user-title" style={{ margin: 0 }}>Yangi foydalanuvchi qo'shish</h4>
                    <button
                      type="button"
                      className="password-generate-btn"
                      onClick={() => {
                        const generated = generateStrongPassword(16);
                        setNewUser(p => ({ ...p, password: generated }));
                        setShowPassword(true);
                      }}
                    >
                      <Sparkles size={13} />
                      Kuchli parol generatsiya qilish
                    </button>
                  </div>

                  <div className="admin-add-user-fields">
                    <input
                      className="admin-input"
                      placeholder="Ism familya (masalan: Alisher Navoiy)"
                      value={newUser.name}
                      onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <input
                      className="admin-input"
                      placeholder="Username (login)"
                      value={newUser.username}
                      onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                      required
                    />
                    <div className="admin-input-pass-wrap">
                      <input
                        className="admin-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Kuchli parol (8+ belgi, Aa1@)"
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
                      <option value="admin">Administrator</option>
                    </select>

                    {/* Parol xavfsizlik ko'rsatkichi */}
                    {newUser.password && (
                      <div className="password-policy-box">
                        <div className="password-strength-header">
                          <span className="password-strength-label">Parol xavfsizligi:</span>
                          <span className="password-strength-value" style={{ color: newUserPolicy.color }}>
                            {newUserPolicy.strength}
                          </span>
                        </div>
                        <div className="password-strength-track">
                          <div
                            className="password-strength-fill"
                            style={{ width: `${newUserPolicy.percent}%`, backgroundColor: newUserPolicy.color }}
                          />
                        </div>
                        <div className="password-criteria-list">
                          {newUserPolicy.criteria.map(c => (
                            <div key={c.id} className={`password-criterion ${c.passed ? 'passed' : ''}`}>
                              {c.passed ? (
                                <Check size={12} color="#10b981" />
                              ) : (
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-medium)', display: 'inline-block' }} />
                              )}
                              <span>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {addError && <p className="admin-add-error">{addError}</p>}
                  <div className="admin-add-user-actions">
                    <button type="button" className="admin-cancel-btn" onClick={() => setShowAddUser(false)}>
                      Bekor
                    </button>
                    <button type="submit" className="admin-save-btn" disabled={!newUserPolicy.isValid}>
                      <Plus size={14} />
                      Qo'shish
                    </button>
                  </div>
                </form>
              )}

              <div className="admin-user-list">
                {users.map(user => (
                  <div key={user.id || user._id} className="admin-user-card">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        className="admin-user-action-btn"
                        onClick={() => {
                          setResetModalUser(user);
                          setResetNewPassword('');
                          setResetStatus({ loading: false, error: '', success: '' });
                        }}
                        title="Parolni yangilash"
                      >
                        <KeyRound size={15} />
                      </button>
                      {(user.id || user._id) !== (currentUser.id || currentUser._id) && (
                        <button
                          className="admin-user-delete-btn"
                          onClick={() => removeUser(user.id || user._id)}
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: XAVFSIZLIK & PAROL O'ZGARTIRISH */}
          {activeTab === 'security' && (
            <div className="admin-security-wrap">
              <div className="admin-security-card">
                <h3 className="admin-security-card-title">
                  <Lock size={18} color="#8b5cf6" />
                  Administrator Parolini Yangilash
                </h3>
                <p className="admin-security-card-desc">
                  Tizim buzilishini mutlaqo imkonsiz qilish uchun parolingiz standart xavfsizlik talablariga mos kelishi shart:
                  kamida 8 ta belgi, bosh harf, kichik harf, raqam va maxsus simvollar (!@#$%^&*).
                </p>

                <form className="admin-security-form" onSubmit={handleChangeMyPassword}>
                  {/* Joriy parol */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Joriy parol
                    </label>
                    <div className="admin-input-pass-wrap">
                      <input
                        className="admin-input"
                        type={secShowCurr ? 'text' : 'password'}
                        placeholder="Joriy parolingizni kiriting"
                        value={secForm.currentPassword}
                        onChange={e => setSecForm(p => ({ ...p, currentPassword: e.target.value }))}
                        required
                      />
                      <button type="button" className="admin-eye-btn" onClick={() => setSecShowCurr(p => !p)}>
                        {secShowCurr ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Yangi parol */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Yangi kuchli parol
                      </label>
                      <button
                        type="button"
                        className="password-generate-btn"
                        style={{ marginTop: 0, padding: '3px 8px', fontSize: '0.72rem' }}
                        onClick={() => {
                          const generated = generateStrongPassword(16);
                          setSecForm(p => ({ ...p, newPassword: generated, confirmPassword: generated }));
                          setSecShowNew(true);
                        }}
                      >
                        <Sparkles size={11} />
                        Tasodifiy kuchli parol
                      </button>
                    </div>
                    <div className="admin-input-pass-wrap">
                      <input
                        className="admin-input"
                        type={secShowNew ? 'text' : 'password'}
                        placeholder="Masalan: Aa1@Secure_2026"
                        value={secForm.newPassword}
                        onChange={e => setSecForm(p => ({ ...p, newPassword: e.target.value }))}
                        required
                      />
                      <button type="button" className="admin-eye-btn" onClick={() => setSecShowNew(p => !p)}>
                        {secShowNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Kriteriyalar ko'rsatkichi */}
                    {secForm.newPassword && (
                      <div className="password-policy-box" style={{ marginTop: 8 }}>
                        <div className="password-strength-header">
                          <span className="password-strength-label">Daraja:</span>
                          <span className="password-strength-value" style={{ color: secPolicy.color }}>
                            {secPolicy.strength}
                          </span>
                        </div>
                        <div className="password-strength-track">
                          <div
                            className="password-strength-fill"
                            style={{ width: `${secPolicy.percent}%`, backgroundColor: secPolicy.color }}
                          />
                        </div>
                        <div className="password-criteria-list">
                          {secPolicy.criteria.map(c => (
                            <div key={c.id} className={`password-criterion ${c.passed ? 'passed' : ''}`}>
                              {c.passed ? (
                                <Check size={12} color="#10b981" />
                              ) : (
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-medium)', display: 'inline-block' }} />
                              )}
                              <span>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parolni tasdiqlash */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Yangi parolni tasdiqlang
                    </label>
                    <input
                      className="admin-input"
                      type="password"
                      placeholder="Yangi parolni qayta tering"
                      value={secForm.confirmPassword}
                      onChange={e => setSecForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>

                  {secStatus.error && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} />
                      {secStatus.error}
                    </div>
                  )}

                  {secStatus.success && (
                    <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} />
                      {secStatus.success}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="admin-save-btn"
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                    disabled={secStatus.loading || !secPolicy.isValid || secForm.newPassword !== secForm.confirmPassword}
                  >
                    {secStatus.loading ? 'Saqlanmoqda...' : 'Parolni yangilash'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Foydalanuvchi parolini admin tomonidan yangilash */}
        {resetModalUser && (
          <div className="modal-overlay" style={{ zIndex: 9300 }} onClick={e => e.target === e.currentTarget && setResetModalUser(null)}>
            <div className="feedback-modal" style={{ maxWidth: 460 }}>
              <div className="feedback-modal-header">
                <div className="feedback-modal-title-wrap">
                  <div className="feedback-modal-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="feedback-modal-title">Parolni Yangilash</h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      @{resetModalUser.username} ({resetModalUser.name})
                    </p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setResetModalUser(null)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleResetUserPassword} style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Yangi kuchli parol</label>
                  <button
                    type="button"
                    className="password-generate-btn"
                    style={{ marginTop: 0, padding: '3px 8px', fontSize: '0.72rem' }}
                    onClick={() => {
                      const generated = generateStrongPassword(16);
                      setResetNewPassword(generated);
                      setResetShowPwd(true);
                    }}
                  >
                    <Sparkles size={11} />
                    Generatsiya qilish
                  </button>
                </div>

                <div className="admin-input-pass-wrap" style={{ marginBottom: 10 }}>
                  <input
                    className="admin-input"
                    type={resetShowPwd ? 'text' : 'password'}
                    placeholder="Yangi kuchli parol kiriting"
                    value={resetNewPassword}
                    onChange={e => setResetNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="admin-eye-btn" onClick={() => setResetShowPwd(p => !p)}>
                    {resetShowPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {resetNewPassword && (
                  <div className="password-policy-box" style={{ marginBottom: 12 }}>
                    <div className="password-strength-header">
                      <span className="password-strength-label">Daraja:</span>
                      <span className="password-strength-value" style={{ color: resetPolicy.color }}>
                        {resetPolicy.strength}
                      </span>
                    </div>
                    <div className="password-strength-track">
                      <div
                        className="password-strength-fill"
                        style={{ width: `${resetPolicy.percent}%`, backgroundColor: resetPolicy.color }}
                      />
                    </div>
                    <div className="password-criteria-list">
                      {resetPolicy.criteria.map(c => (
                        <div key={c.id} className={`password-criterion ${c.passed ? 'passed' : ''}`}>
                          {c.passed ? <Check size={12} color="#10b981" /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-medium)', display: 'inline-block' }} />}
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resetStatus.error && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 10px' }}>{resetStatus.error}</p>
                )}
                {resetStatus.success && (
                  <p style={{ color: '#10b981', fontSize: '0.8rem', margin: '0 0 10px' }}>{resetStatus.success}</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                  <button type="button" className="admin-cancel-btn" onClick={() => setResetModalUser(null)}>
                    Bekor
                  </button>
                  <button type="submit" className="admin-save-btn" disabled={!resetPolicy.isValid || resetStatus.loading}>
                    {resetStatus.loading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
