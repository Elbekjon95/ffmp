import React, { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { X, Heart, Save, Calendar, MapPin, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const MarriageModal = () => {
  const {
    isMarriageModalOpen,
    closeMarriageModal,
    activeMarriageKey,
    unionsData,
    updateUnionData,
    members,
    collapsedUnions,
    toggleUnionCollapse
  } = useFamily();

  const [formData, setFormData] = useState({
    date: '',
    place: '',
    note: ''
  });

  const [spouse1, setSpouse1] = useState(null);
  const [spouse2, setSpouse2] = useState(null);

  useEffect(() => {
    if (!isMarriageModalOpen || !activeMarriageKey) return;

    const [id1, id2] = activeMarriageKey.split('___');
    setSpouse1(members.find(m => m.id === id1) || null);
    setSpouse2(members.find(m => m.id === id2) || null);

    const existing = unionsData[activeMarriageKey] || {};
    setFormData({
      date: existing.date || '',
      place: existing.place || '',
      note: existing.note || ''
    });
  }, [isMarriageModalOpen, activeMarriageKey, unionsData, members]);

  if (!isMarriageModalOpen || !activeMarriageKey) return null;

  const isCollapsed = collapsedUnions.has(activeMarriageKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUnionData(activeMarriageKey, formData);
  };

  return (
    <div className="modal-overlay" onClick={closeMarriageModal}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Heart size={20} color="var(--color-gold)" fill="var(--color-gold)" />
            <span>Nikoh Rishtasi Ma'lumotlari</span>
          </div>
          <button className="drawer-close-btn" onClick={closeMarriageModal} title="Yopish">
            <X size={18} />
          </button>
        </div>

        {/* Spouses Banner */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.12))',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16
          }}
        >
          {spouse1 && (
            <div style={{ textAlign: 'center' }}>
              <img src={spouse1.avatar} alt={spouse1.firstName} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--color-blue)' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {spouse1.firstName} {spouse1.lastName}
              </div>
            </div>
          )}

          <div style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} fill="var(--color-gold)" />
          </div>

          {spouse2 && (
            <div style={{ textAlign: 'center' }}>
              <img src={spouse2.avatar} alt={spouse2.firstName} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--color-rose)' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {spouse2.firstName} {spouse2.lastName}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} />
              <span>Nikoh / To'y sanasi yoki yili</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: 1948-yil yoki 1948-09-20"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} />
              <span>Nikoh tuzilgan joy / Shahar</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Toshkent shahri"
              value={formData.place}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} />
              <span>Xotiralar yoki Qo'shimcha izoh</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="To'y marosimi va oilaviy xotiralar haqida..."
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            />
          </div>

          {/* Quick Collapse / Expand control in modal too */}
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Pastki avlodlarni ko'rsatish holati</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {isCollapsed ? "Hozirda pastki shox yashirilgan" : "Hozirda barcha farzandlar ko'rinmoqda"}
              </div>
            </div>
            <button
              type="button"
              className={`btn ${isCollapsed ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => toggleUnionCollapse(activeMarriageKey)}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              <span>{isCollapsed ? "Ochish (Yoyish)" : "Yopish (Yashirish)"}</span>
            </button>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ padding: '16px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn btn-secondary" onClick={closeMarriageModal}>
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
