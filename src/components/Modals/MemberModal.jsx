import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { AVATAR_PRESETS, getDefaultAvatar } from '../../data/avatars';
import { 
  X, 
  UserPlus, 
  Save, 
  Image, 
  Upload
} from 'lucide-react';

export const MemberModal = () => {
  const {
    isAddEditModalOpen,
    closeAddEditModal,
    modalMode,
    editingMember,
    addRelationContext,
    members,
    addMember,
    updateMember
  } = useFamily();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    maidenName: '',
    gender: 'male',
    birthDate: '',
    deathDate: '',
    isAlive: true,
    birthPlace: '',
    currentPlace: '',
    profession: '',
    bio: '',
    avatar: AVATAR_PRESETS[2].svg,
    parents: [],
    spouses: [],
    children: []
  });

  // Populate form on open
  useEffect(() => {
    if (!isAddEditModalOpen) return;

    if (modalMode === 'edit' && editingMember) {
      setFormData({
        firstName: editingMember.firstName || '',
        lastName: editingMember.lastName || '',
        maidenName: editingMember.maidenName || '',
        gender: editingMember.gender || 'male',
        birthDate: editingMember.birthDate || '',
        deathDate: editingMember.deathDate || '',
        isAlive: editingMember.isAlive ?? true,
        birthPlace: editingMember.birthPlace || '',
        currentPlace: editingMember.currentPlace || '',
        profession: editingMember.profession || '',
        bio: editingMember.bio || '',
        avatar: editingMember.avatar || AVATAR_PRESETS[2].svg,
        parents: editingMember.parents || [],
        spouses: editingMember.spouses || [],
        children: editingMember.children || []
      });
    } else {
      // Add mode
      const defaultGender = addRelationContext?.relationType === 'spouse' 
        ? (members.find(m => m.id === addRelationContext.relativeId)?.gender === 'male' ? 'female' : 'male')
        : 'male';

      const initialParents = [];
      const initialSpouses = [];
      const initialChildren = [];

      if (addRelationContext) {
        const { relativeId, relationType } = addRelationContext;
        const relative = members.find(m => m.id === relativeId);

        if (relationType === 'child' && relative) {
          initialParents.push(relativeId);
          if (relative.spouses && relative.spouses.length > 0) {
            initialParents.push(relative.spouses[0]);
          }
        } else if (relationType === 'spouse') {
          initialSpouses.push(relativeId);
        } else if (relationType === 'parent') {
          initialChildren.push(relativeId);
        }
      }

      setFormData({
        firstName: '',
        lastName: '',
        maidenName: '',
        gender: defaultGender,
        birthDate: '',
        deathDate: '',
        isAlive: true,
        birthPlace: '',
        currentPlace: '',
        profession: '',
        bio: '',
        avatar: getDefaultAvatar(defaultGender, 'adult'),
        parents: initialParents,
        spouses: initialSpouses,
        children: initialChildren
      });
    }
  }, [isAddEditModalOpen, modalMode, editingMember, addRelationContext, members]);

  if (!isAddEditModalOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
      avatar: getDefaultAvatar(gender, 'adult')
    }));
  };

  // Image Upload handler (File from computer)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm hajmi 5MB dan oshmasligi kerak.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        avatar: event.target.result
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("Iltimos, a'zoning ismi va familiyasini kiriting.");
      return;
    }

    if (modalMode === 'edit' && editingMember) {
      updateMember({
        ...formData,
        id: editingMember.id,
        generation: editingMember.generation
      });
    } else {
      addMember(formData);
    }
  };

  // Available candidate members
  const currentId = editingMember?.id;
  const availableMembers = members.filter(m => m.id !== currentId);
  const potentialFathers = availableMembers.filter(m => m.gender === 'male');
  const potentialMothers = availableMembers.filter(m => m.gender === 'female');
  const potentialSpouses = availableMembers;

  const fatherId = formData.parents.find(pId => members.find(m => m.id === pId)?.gender === 'male') || '';
  const motherId = formData.parents.find(pId => members.find(m => m.id === pId)?.gender === 'female') || '';

  const handleParentSelect = (pId, gender) => {
    setFormData(prev => {
      const otherParents = prev.parents.filter(id => {
        const m = members.find(x => x.id === id);
        return m && m.gender !== gender;
      });
      return {
        ...prev,
        parents: pId ? [...otherParents, pId] : otherParents
      };
    });
  };

  // Multiple Spouses Toggle / Add / Remove
  const toggleSpouse = (sId) => {
    setFormData(prev => {
      const exists = prev.spouses.includes(sId);
      return {
        ...prev,
        spouses: exists ? prev.spouses.filter(id => id !== sId) : [...prev.spouses, sId]
      };
    });
  };

  return (
    <div className="modal-overlay" onClick={closeAddEditModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            {modalMode === 'edit' ? <Save size={18} color="var(--color-blue)" /> : <UserPlus size={18} color="var(--color-blue)" />}
            <span>{modalMode === 'edit' ? "A'zo ma'lumotlarini tahrirlash" : "Yangi oila a'zosi qo'shish"}</span>
          </div>
          <button className="drawer-close-btn" onClick={closeAddEditModal} title="Yopish">
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Gender selection */}
          <div className="form-group">
            <label className="form-label">Jinsi</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className={`btn ${formData.gender === 'male' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleGenderChange('male')}
              >
                Erkak
              </button>
              <button
                type="button"
                className={`btn ${formData.gender === 'female' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => handleGenderChange('female')}
              >
                Ayol
              </button>
            </div>
          </div>

          {/* Names */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ismi *</label>
              <input
                type="text"
                name="firstName"
                required
                className="form-input"
                placeholder="Masalan: Jasur"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Familiyasi *</label>
              <input
                type="text"
                name="lastName"
                required
                className="form-input"
                placeholder="Masalan: Karimov"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.gender === 'female' && (
            <div className="form-group">
              <label className="form-label">Qizlik familiyasi (agar bo'lsa)</label>
              <input
                type="text"
                name="maidenName"
                className="form-input"
                placeholder="Masalan: Xoliqova"
                value={formData.maidenName}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Photo / Avatar Section with Upload & Presets */}
          <div className="form-group" style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Image size={15} color="var(--color-blue)" />
                <span style={{ fontWeight: 700 }}>Fotosurat / Avatar</span>
              </label>

              {/* Upload Button */}
              <div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.78rem', gap: 6 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} color="var(--color-blue)" />
                  <span>Kompyuterdan rasm yuklash</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Current Active Avatar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <img
                src={formData.avatar}
                alt="Tanlangan avatar"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-blue)',
                  boxShadow: '0 2px 8px var(--color-blue-glow)'
                }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Quyidagi tayyor grafikalardan birini tanlashingiz yoki kompyuterdan o'zingizning haqiqiy rasmingizni yuklashingiz mumkin.
              </div>
            </div>

            {/* Avatar Presets Grid */}
            <div className="avatar-picker-grid">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`avatar-preset-btn ${formData.avatar === preset.svg ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: preset.svg }))}
                  title={preset.label}
                >
                  <img src={preset.svg} alt={preset.label} className="avatar-preset-img" />
                </button>
              ))}
            </div>
          </div>

          {/* Alive status & Dates */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.86rem' }}>
              <input
                type="checkbox"
                name="isAlive"
                checked={formData.isAlive}
                onChange={handleChange}
                style={{ width: 16, height: 16, accentColor: 'var(--color-blue)' }}
              />
              <span style={{ fontWeight: 600 }}>Hozir hayot</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tug'ilgan sanasi / yili</label>
              <input
                type="text"
                name="birthDate"
                className="form-input"
                placeholder="Masalan: 1980-07-22 yoki 1980"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
            {!formData.isAlive && (
              <div className="form-group">
                <label className="form-label">Vafot etgan sanasi / yili</label>
                <input
                  type="text"
                  name="deathDate"
                  className="form-input"
                  placeholder="Masalan: 2020-04-14 yoki 2020"
                  value={formData.deathDate}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Profession & Place */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kasbi / Faoliyati</label>
              <input
                type="text"
                name="profession"
                className="form-input"
                placeholder="Masalan: Dasturiy ta'minot muhandisi"
                value={formData.profession}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tug'ilgan / Yashash joyi</label>
              <input
                type="text"
                name="birthPlace"
                className="form-input"
                placeholder="Masalan: Toshkent, O'zbekiston"
                value={formData.birthPlace}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Relationships Links: Parents & Multiple Spouses */}
          <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Qarindoshlik aloqalari
            </div>

            {/* Parents Selection */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Otasi</label>
                <select
                  className="form-select"
                  value={fatherId}
                  onChange={(e) => handleParentSelect(e.target.value, 'male')}
                >
                  <option value="">-- Tanlanmagan --</option>
                  {potentialFathers.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.birthDate ? p.birthDate.slice(0,4) : '?'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Onasi</label>
                <select
                  className="form-select"
                  value={motherId}
                  onChange={(e) => handleParentSelect(e.target.value, 'female')}
                >
                  <option value="">-- Tanlanmagan --</option>
                  {potentialMothers.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.birthDate ? p.birthDate.slice(0,4) : '?'})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Multiple Spouses Selection */}
            <div className="form-group" style={{ marginTop: 4 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Turmush o'rtoqlari (Juftlari - Bir nechta tanlash mumkin)</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-blue)' }}>Tanlangan: {formData.spouses.length} ta</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: 150, overflowY: 'auto', padding: '6px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
                {potentialSpouses.map(s => {
                  const isSelected = formData.spouses.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSpouse(s.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--color-blue-light)' : 'transparent',
                        border: isSelected ? '1px solid var(--color-blue)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: 'var(--color-blue)' }}
                      />
                      <img src={s.avatar} alt={s.firstName} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                        {s.firstName} {s.lastName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Tarjimai hol va xotiralar</label>
            <textarea
              name="bio"
              className="form-textarea"
              placeholder="Hayot yo'li, erishgan yutuqlari va oiladagi o'rni haqida qisqacha..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Modal Footer inside form */}
          <div className="modal-footer" style={{ padding: '12px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn btn-secondary" onClick={closeAddEditModal}>
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              <span>{modalMode === 'edit' ? "O'zgarishlarni saqlash" : "Daraxtga qo'shish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
