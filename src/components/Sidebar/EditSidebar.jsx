import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { AVATAR_PRESETS, getDefaultAvatar } from '../../data/avatars';
import { X, Upload, Trash2, Eye } from 'lucide-react';

export const EditSidebar = () => {
  const {
    selectedMember,
    pendingRelation,
    setPendingRelation,
    sidebarOpen,
    setSidebarOpen,
    addMember,
    updateMember,
    deleteMember,
    openDetail,
    members
  } = useFamily();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    birthDate: '',
    avatar: AVATAR_PRESETS[4].svg,
    profession: '',
    bio: '',
    isAlive: true
  });

  // Populate sidebar form depending on whether editing selectedMember or adding a new pendingRelation
  useEffect(() => {
    if (pendingRelation) {
      // Adding a new relative via Ghost Card (+ Add Father / Mother / Spouse / Son / Daughter)
      const { relationType } = pendingRelation;
      let gender = 'male';
      if (relationType === 'mother' || relationType === 'daughter') {
        gender = 'female';
      } else if (relationType === 'spouse') {
        gender = selectedMember?.gender === 'male' ? 'female' : 'male';
      }

      setFormData({
        firstName: '',
        lastName: selectedMember?.lastName || '',
        gender,
        birthDate: '',
        avatar: getDefaultAvatar(gender, relationType.includes('father') || relationType.includes('mother') ? 'elder' : (relationType.includes('son') || relationType.includes('daughter') ? 'child' : 'adult')),
        profession: '',
        bio: '',
        isAlive: true
      });
      setSidebarOpen(true);
    } else if (selectedMember) {
      // Editing existing selected member
      setFormData({
        firstName: selectedMember.firstName || '',
        lastName: selectedMember.lastName || '',
        gender: selectedMember.gender || 'male',
        birthDate: selectedMember.birthDate || '',
        avatar: selectedMember.avatar || getDefaultAvatar(selectedMember.gender || 'male'),
        profession: selectedMember.profession || '',
        bio: selectedMember.bio || '',
        isAlive: selectedMember.isAlive ?? true
      });
    }
  }, [selectedMember, pendingRelation, setSidebarOpen]);

  if (!sidebarOpen || (!selectedMember && !pendingRelation)) {
    return null;
  }

  const isAdding = !!pendingRelation;

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender,
      avatar: getDefaultAvatar(gender, 'adult')
    }));
  };

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
    if (!formData.firstName.trim()) {
      alert("Iltimos, ismni kiriting.");
      return;
    }

    if (isAdding && pendingRelation) {
      const { relativeId, relationType } = pendingRelation;
      const relative = members.find(m => m.id === relativeId);

      const parents = [];
      const spouses = [];
      const children = [];

      if (relationType === 'father' || relationType === 'mother') {
        children.push(relativeId);
        // If relative already has another parent, marry them
        if (relative && relative.parents && relative.parents.length > 0) {
          spouses.push(relative.parents[0]);
        }
      } else if (relationType === 'spouse') {
        spouses.push(relativeId);
      } else if (relationType === 'son' || relationType === 'daughter') {
        parents.push(relativeId);
        if (relative && relative.spouses && relative.spouses.length > 0) {
          parents.push(relative.spouses[0]);
        }
      }

      addMember({
        ...formData,
        parents,
        spouses,
        children
      });

      setPendingRelation(null);
    } else if (selectedMember) {
      updateMember({
        ...selectedMember,
        ...formData
      });
    }
  };

  const handleCancel = () => {
    setPendingRelation(null);
    if (isAdding) {
      // keep sidebar open on selected member if there was one
    } else {
      setSidebarOpen(false);
    }
  };

  const handleDelete = () => {
    if (!selectedMember) return;
    if (window.confirm(`${selectedMember.firstName} ${selectedMember.lastName}ni o'chirishni tasdiqlaysizmi?`)) {
      deleteMember(selectedMember.id);
      setSidebarOpen(false);
      setPendingRelation(null);
    }
  };

  const getTitle = () => {
    if (!pendingRelation) {
      return `${formData.firstName || 'Shaxs'} ma'lumotlari`;
    }
    const map = {
      father: "Ota qo'shish (Add Father)",
      mother: "Ona qo'shish (Add Mother)",
      spouse: "Turmush o'rtoq qo'shish (Add Spouse)",
      son: "O'g'il farzand qo'shish (Add Son)",
      daughter: "Qiz farzand qo'shish (Add Daughter)"
    };
    return map[pendingRelation.relationType] || "Qarindosh qo'shish";
  };

  return (
    <div className="family-chart-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">{getTitle()}</span>
        <button className="sidebar-close-btn" onClick={() => { setSidebarOpen(false); setPendingRelation(null); }} title="Yopish">
          <X size={18} />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="sidebar-form">
        {/* Gender Radios */}
        <div className="sidebar-field">
          <div className="gender-radios">
            <label className="radio-label">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === 'male'}
                onChange={() => handleGenderChange('male')}
              />
              <span>Male (Erkak)</span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="gender"
                checked={formData.gender === 'female'}
                onChange={() => handleGenderChange('female')}
              />
              <span>Female (Ayol)</span>
            </label>
          </div>
        </div>

        {/* First Name */}
        <div className="sidebar-field">
          <label className="field-label">first name (Ism)</label>
          <input
            type="text"
            required
            className="sidebar-input"
            placeholder="Name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            autoFocus
          />
        </div>

        {/* Last Name */}
        <div className="sidebar-field">
          <label className="field-label">last name (Familiya)</label>
          <input
            type="text"
            className="sidebar-input"
            placeholder="Surname"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>

        {/* Birthday */}
        <div className="sidebar-field">
          <label className="field-label">birthday (Tug'ilgan yili)</label>
          <input
            type="text"
            className="sidebar-input"
            placeholder="1970"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          />
        </div>

        {/* Avatar Upload / Input */}
        <div className="sidebar-field">
          <label className="field-label">avatar (Fotosurat)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <img
              src={formData.avatar}
              alt="Avatar"
              style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-tertiary)'
              }}
            />
            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} />
                <span>Rasm yuklash</span>
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

          {/* Quick preset selector */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {AVATAR_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatar: p.svg }))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  border: formData.avatar === p.svg ? '2px solid var(--color-blue)' : '1px solid var(--border-medium)',
                  background: 'var(--bg-tertiary)',
                  padding: 1,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <img src={p.svg} alt={p.label} style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="sidebar-buttons-row">
          <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
            Submit
          </button>
        </div>

        {/* View Profile Button (when editing existing node) */}
        {!isAdding && selectedMember && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: 6 }}
            onClick={() => {
              setSidebarOpen(false);
              openDetail(selectedMember.id);
            }}
          >
            <Eye size={14} />
            <span>To'liq profilni ko'rish</span>
          </button>
        )}

        {/* Delete button (when editing existing node) */}
        {!isAdding && selectedMember && (
          <button type="button" className="btn btn-danger-outline" onClick={handleDelete}>
            <Trash2 size={14} />
            <span>Delete (O'chirish)</span>
          </button>
        )}
      </form>
    </div>
  );
};
