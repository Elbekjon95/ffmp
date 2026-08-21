import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { 
  X, 
  Edit3, 
  UserPlus, 
  Heart, 
  Trash2, 
  Crosshair, 
  Calendar, 
  MapPin, 
  Briefcase, 
  User, 
  Users,
  Award
} from 'lucide-react';

export const MemberDetailDrawer = () => {
  const {
    isDetailDrawerOpen,
    closeDetail,
    selectedMember,
    members,
    openEditModal,
    openAddModal,
    deleteMember,
    focusOnMember,
    openDetail
  } = useFamily();

  if (!isDetailDrawerOpen || !selectedMember) return null;

  const m = selectedMember;

  // Resolve relatives
  const parents = (m.parents || []).map(id => members.find(x => x.id === id)).filter(Boolean);
  const spouses = (m.spouses || []).map(id => members.find(x => x.id === id)).filter(Boolean);
  const children = (m.children || []).map(id => members.find(x => x.id === id)).filter(Boolean);

  // Compute siblings (share at least 1 parent, exclude self)
  const siblings = members.filter(other => {
    if (other.id === m.id) return false;
    if (!other.parents || other.parents.length === 0) return false;
    return other.parents.some(pId => (m.parents || []).includes(pId));
  });

  // Calculate age
  const getAgeText = () => {
    if (!m.birthDate) return null;
    const birthYear = parseInt(m.birthDate.slice(0, 4), 10);
    if (isNaN(birthYear)) return null;

    if (m.isAlive) {
      const currentYear = new Date().getFullYear();
      return `${currentYear - birthYear} yoshda`;
    } else if (m.deathDate) {
      const deathYear = parseInt(m.deathDate.slice(0, 4), 10);
      if (!isNaN(deathYear)) {
        return `${deathYear - birthYear} yil umr ko'rgan`;
      }
    }
    return null;
  };

  const handleJumpToRelative = (relId) => {
    openDetail(relId);
    focusOnMember(relId);
  };

  return (
    <div className="drawer-overlay" onClick={closeDetail}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        {/* Hero Section */}
        <div className="drawer-hero">
          <button className="drawer-close-btn" onClick={closeDetail} title="Yopish">
            <X size={18} />
          </button>

          <img src={m.avatar} alt={m.firstName} className="drawer-avatar" />

          <h2 className="drawer-name">
            {m.firstName} {m.lastName}
          </h2>

          {m.maidenName && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              (Qizlik familiyasi: {m.maidenName})
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <span
              className="drawer-badge"
              style={{
                background: m.gender === 'male' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: m.gender === 'male' ? 'var(--color-blue)' : 'var(--color-rose)',
                border: `1px solid ${m.gender === 'male' ? 'var(--color-blue)' : 'var(--color-rose)'}`
              }}
            >
              {m.generation}-avlod &bull; {m.gender === 'male' ? 'Erkak' : 'Ayol'}
            </span>

            <span
              className="drawer-badge"
              style={{
                background: m.isAlive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                color: m.isAlive ? 'var(--color-emerald)' : 'var(--text-muted)',
                border: `1px solid ${m.isAlive ? 'var(--color-emerald)' : 'var(--border-medium)'}`
              }}
            >
              {m.isAlive ? 'Hayot' : 'Vafot etgan'}
            </span>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18, width: '100%', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => focusOnMember(m.id)}
              title="Daraxtda markazlashtirish"
            >
              <Crosshair size={14} />
              <span>Markaz</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => openEditModal(m)}
              title="Tahrirlash"
            >
              <Edit3 size={14} />
              <span>Tahrirlash</span>
            </button>

            <button
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => openAddModal({ relativeId: m.id, relationType: 'child' })}
              title="Farzand qo'shish"
            >
              <UserPlus size={14} />
              <span>+ Farzand</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="drawer-section">
          <div className="drawer-section-title">
            <Calendar size={15} />
            <span>Asosiy Ma'lumotlar</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tug'ilgan sanasi:</span>
              <span style={{ fontWeight: 600 }}>{m.birthDate || 'Kiritilmagan'}</span>
            </div>

            {!m.isAlive && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vafot etgan sanasi:</span>
                <span style={{ fontWeight: 600 }}>{m.deathDate || 'Kiritilmagan'}</span>
              </div>
            )}

            {getAgeText() && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Yoshi:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-emerald)' }}>{getAgeText()}</span>
              </div>
            )}

            {m.profession && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kasbi / Soha:</span>
                <span style={{ fontWeight: 600 }}>{m.profession}</span>
              </div>
            )}

            {m.birthPlace && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Manzili:</span>
                <span style={{ fontWeight: 600 }}>{m.birthPlace}</span>
              </div>
            )}
          </div>
        </div>

        {/* Biography */}
        {m.bio && (
          <div className="drawer-section">
            <div className="drawer-section-title">
              <Award size={15} />
              <span>Tarjimai hol va Xotiralar</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {m.bio}
            </p>
          </div>
        )}

        {/* Relatives Sections */}
        <div className="drawer-section">
          <div className="drawer-section-title">
            <Users size={15} />
            <span>Yaqin Qarindoshlar</span>
          </div>

          <div className="relatives-grid">
            {/* Parents */}
            {parents.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>OTA-ONASI:</div>
                {parents.map(p => (
                  <div key={p.id} className="relative-card" onClick={() => handleJumpToRelative(p.id)}>
                    <img src={p.avatar} alt={p.firstName} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                      <div className="relative-role">{p.gender === 'male' ? 'Otasi' : 'Onasi'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Spouses */}
            {spouses.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>TURMUSH O'RTOG'I:</div>
                {spouses.map(s => (
                  <div key={s.id} className="relative-card" onClick={() => handleJumpToRelative(s.id)}>
                    <img src={s.avatar} alt={s.firstName} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                      <div className="relative-role">Jufti (Turmush o'rtog'i)</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Siblings */}
            {siblings.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>AKA-UKA VA OPA-SINGILLARI:</div>
                {siblings.map(sib => (
                  <div key={sib.id} className="relative-card" onClick={() => handleJumpToRelative(sib.id)}>
                    <img src={sib.avatar} alt={sib.firstName} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sib.firstName} {sib.lastName}</div>
                      <div className="relative-role">{sib.gender === 'male' ? 'Aka / Uka' : 'Opa / Singil'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>FARZANDLARI:</div>
                {children.map(c => (
                  <div key={c.id} className="relative-card" onClick={() => handleJumpToRelative(c.id)}>
                    <img src={c.avatar} alt={c.firstName} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                      <div className="relative-role">{c.gender === 'male' ? 'O\'g\'il' : 'Qiz'} farzand</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {parents.length === 0 && spouses.length === 0 && children.length === 0 && siblings.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '10px 0' }}>
                Hozircha biriktirilgan qarindoshlar yo'q.
              </div>
            )}
          </div>
        </div>

        {/* Delete button at bottom */}
        <div style={{ padding: '20px 24px', marginTop: 'auto' }}>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', color: 'var(--color-rose)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
            onClick={() => {
              if (window.confirm(`${m.firstName} ${m.lastName}ni o'chirishni tasdiqlaysizmi?`)) {
                deleteMember(m.id);
              }
            }}
          >
            <Trash2 size={16} />
            <span>A'zoni butunlay o'chirish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
