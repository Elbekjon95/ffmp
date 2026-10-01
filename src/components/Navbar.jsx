import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { exportTreeAsImage } from '../utils/exportUtils';
import { 
  TreePine, 
  Search, 
  Plus, 
  BarChart2, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  RefreshCw, 
  FileDown, 
  Camera,
  ChevronDown,
  MessageSquare,
  Shield,
  LogOut,
  User
} from 'lucide-react';

export const Navbar = ({ onOpenFeedback, onOpenAdmin }) => {
  const { currentUser, logout, isAdmin, feedbacks } = useAuth();
  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
  const {
    theme,
    toggleTheme,
    members,
    openAddModal,
    setIsStatsModalOpen,
    searchQuery,
    setSearchQuery,
    filterGen,
    setFilterGen,
    filterGender,
    setFilterGender,
    filterStatus,
    setFilterStatus,
    focusOnMember,
    openDetail,
    exportJSON,
    importJSON,
    resetToSingleRoot,
    loadDemoSample
  } = useFamily();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const fileInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (!e.target.closest('.export-dropdown-wrap')) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered members for search dropdown
  const searchResults = searchQuery.trim()
    ? members.filter(m =>
        `${m.firstName} ${m.lastName} ${m.profession || ''} ${m.birthPlace || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (id) => {
    focusOnMember(id);
    openDetail(id);
    setIsSearchFocused(false);
  };

  return (
    <header className="navbar">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-icon">
          <TreePine size={26} />
        </div>
        <div className="brand-titles">
          <div className="brand-name">
            <span>Shajara</span>
            <span className="brand-badge">Oila Daraxti</span>
          </div>
          <span className="brand-tagline">Avlodlar va nasabnomalar xazinasi</span>
        </div>
      </div>

      {/* Center: Search & Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 650, margin: '0 16px' }}>
        {/* Search Bar */}
        <div ref={searchWrapRef} style={{ position: 'relative', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              height: 38
            }}
          >
            <Search size={16} color="var(--text-muted)" style={{ marginRight: 8 }} />
            <input
              type="text"
              placeholder="Shaxsni ism, kasb yoki joy bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                fontSize: '0.86rem',
                fontFamily: 'var(--font-body)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Live Search Suggestions Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                left: 0,
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                maxHeight: 300,
                overflowY: 'auto'
              }}
            >
              {searchResults.map(m => (
                <div
                  key={m.id}
                  onClick={() => handleSelectSearchResult(m.id)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={m.avatar} alt={m.firstName} style={{ width: 30, height: 30, borderRadius: '50%' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.firstName} {m.lastName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {m.generation}-avlod &bull; {m.profession || 'Kasbi ko\'rsatilmagan'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generation Filter */}
        <select
          className="form-select"
          style={{ height: 38, padding: '0 10px', fontSize: '0.8rem', minWidth: 100 }}
          value={filterGen}
          onChange={(e) => setFilterGen(e.target.value)}
          title="Avlod bo'yicha filtr"
        >
          <option value="all">Barcha avlod</option>
          <option value="1">1-Avlod</option>
          <option value="2">2-Avlod</option>
          <option value="3">3-Avlod</option>
          <option value="4">4-Avlod</option>
        </select>

        {/* Gender Filter */}
        <select
          className="form-select"
          style={{ height: 38, padding: '0 10px', fontSize: '0.8rem', minWidth: 95 }}
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          title="Jinsi bo'yicha filtr"
        >
          <option value="all">Barcha jins</option>
          <option value="male">Erkaklar</option>
          <option value="female">Ayollar</option>
        </select>

        {/* Life Status Filter */}
        <select
          className="form-select"
          style={{ height: 38, padding: '0 10px', fontSize: '0.8rem', minWidth: 95 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          title="Holati bo'yicha filtr (Hayot / Vafot etgan)"
        >
          <option value="all">Barcha holat</option>
          <option value="alive">Hayot</option>
          <option value="deceased">Vafot etgan</option>
        </select>
      </div>

      {/* Right Action Buttons */}
      <div className="nav-actions">
        {/* Statistics Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setIsStatsModalOpen(true)}
          title="Sulola statistikasi"
        >
          <BarChart2 size={16} />
          <span>Statistika</span>
        </button>

        {/* Add Member Button */}
        <button
          className="btn btn-primary"
          onClick={() => openAddModal(null)}
          title="Yangi oila a'zosi qo'shish"
        >
          <Plus size={16} />
          <span>Yangi A'zo</span>
        </button>

        {/* Export / Import Dropdown */}
        <div className="export-dropdown-wrap" style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsExportMenuOpen(prev => !prev)}
            title="Eksport va Import amallari"
          >
            <Download size={16} />
            <ChevronDown size={14} />
          </button>

          {isExportMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                right: 0,
                width: 220,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '6px 0'
              }}
            >
              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', borderRadius: 0 }}
                onClick={() => {
                  exportTreeAsImage();
                  setIsExportMenuOpen(false);
                }}
              >
                <Camera size={15} style={{ marginRight: 8 }} />
                <span>PNG Rasm saqlash</span>
              </button>

              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', borderRadius: 0 }}
                onClick={() => {
                  exportJSON();
                  setIsExportMenuOpen(false);
                }}
              >
                <FileDown size={15} style={{ marginRight: 8 }} />
                <span>JSON fayl yuklab olish</span>
              </button>

              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', borderRadius: 0 }}
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsExportMenuOpen(false);
                }}
              >
                <Upload size={15} style={{ marginRight: 8 }} />
                <span>JSON faylni yuklash</span>
              </button>

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', borderRadius: 0, color: 'var(--color-blue)' }}
                onClick={() => {
                  loadDemoSample();
                  setIsExportMenuOpen(false);
                }}
              >
                <RefreshCw size={15} style={{ marginRight: 8 }} />
                <span>Namuna shajarani yuklash</span>
              </button>

              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px', borderRadius: 0, color: 'var(--color-rose)' }}
                onClick={() => {
                  resetToSingleRoot();
                  setIsExportMenuOpen(false);
                }}
              >
                <RefreshCw size={15} style={{ marginRight: 8 }} />
                <span>Daraxtni tozalash (1 ta shaxs)</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input for JSON import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={importJSON}
          accept=".json"
          style={{ display: 'none' }}
        />

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? "Yorug' mavzuga o'tish" : "Qorong'u mavzuga o'tish"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Feedback Button */}
        <button
          className="btn-icon navbar-feedback-btn"
          onClick={onOpenFeedback}
          title="Fikr qoldirish yoki murojaat"
        >
          <MessageSquare size={18} />
        </button>

        {/* Admin Panel (only for admin) */}
        {isAdmin && (
          <button
            className="btn-icon navbar-admin-btn"
            onClick={onOpenAdmin}
            title="Admin panel"
            style={{ position: 'relative' }}
          >
            <Shield size={18} />
            {pendingCount > 0 && (
              <span className="navbar-admin-badge">{pendingCount}</span>
            )}
          </button>
        )}

        {/* User Info + Logout */}
        <div className="navbar-user-menu">
          <div className="navbar-user-avatar">
            {isAdmin ? <Shield size={14} /> : <User size={14} />}
          </div>
          <span className="navbar-user-name">{currentUser?.name}</span>
          <button
            className="btn-icon navbar-logout-btn"
            onClick={logout}
            title="Chiqish"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
