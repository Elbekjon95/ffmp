import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { calculateTreeLayout } from '../utils/treeLayout';
import confetti from 'canvas-confetti';
import { INITIAL_FAMILY_DATA, SAMPLE_DEMO_FAMILY_DATA } from '../data/initialFamilyData';

const FamilyContext = createContext(null);

const STORAGE_KEY = 'shajara_family_members_v3';
const UNIONS_STORAGE_KEY = 'shajara_unions_data_v3';
const THEME_KEY = 'shajara_theme_v2';

// Initial sample marriage data for demo
const DEMO_UNIONS_DATA = {
  '1___2': { date: '1948', place: 'Toshkent', note: 'Qo\'shaloq to\'y marosimi' },
  '3___4': { date: '1978', place: 'Toshkent', note: 'Talabalik yillaridagi nikoh' },
  '5___6': { date: '1979', place: 'Farg\'ona', note: '' },
  '7___8': { date: '1987', place: 'Toshkent', note: '' },
  '9___10': { date: '2006', place: 'Toshkent', note: '' },
  '11___12': { date: '2010', place: 'Toshkent', note: '' },
  '13___14': { date: '2014', place: 'Farg\'ona', note: '' }
};

export const FamilyProvider = ({ children }) => {
  // Theme state: Minimalist White & Blue as default
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Members state
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load from storage', e);
    }
    return INITIAL_FAMILY_DATA;
  });

  // Unions metadata state (Marriage dates & places)
  const [unionsData, setUnionsData] = useState(() => {
    try {
      const saved = localStorage.getItem(UNIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load unions data', e);
    }
    return {};
  });

  // Collapsed unions set (hidden descendants)
  const [collapsedUnions, setCollapsedUnions] = useState(new Set());

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      localStorage.setItem(UNIONS_STORAGE_KEY, JSON.stringify(unionsData));
    } catch (e) {
      console.error('Failed to save to storage', e);
    }
  }, [members, unionsData]);

  // Modals & Drawers state
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [highlightedMemberId, setHighlightedMemberId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRelation, setPendingRelation] = useState(null); // { relativeId, relationType }
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isMarriageModalOpen, setIsMarriageModalOpen] = useState(false);
  const [activeMarriageKey, setActiveMarriageKey] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingMember, setEditingMember] = useState(null);
  const [addRelationContext, setAddRelationContext] = useState(null); // { relativeId, relationType }

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGen, setFilterGen] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'alive' | 'deceased'

  // Canvas Viewport transform state: { x, y, scale }
  const [transform, setTransform] = useState({ x: 100, y: 80, scale: 0.85 });

  // Calculate layout coordinates with collapsed unions and dynamic selection shift taken into account
  const layout = useMemo(() => {
    return calculateTreeLayout(members, collapsedUnions, unionsData, selectedMemberId);
  }, [members, collapsedUnions, unionsData, selectedMemberId]);

  // Selected member object
  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Toggle union collapse/expand
  const toggleUnionCollapse = useCallback((unionKey) => {
    setCollapsedUnions(prev => {
      const next = new Set(prev);
      if (next.has(unionKey)) {
        next.delete(unionKey);
      } else {
        next.add(unionKey);
      }
      return next;
    });
  }, []);

  // Open Marriage Modal to edit date/info
  const openMarriageModal = useCallback((unionKey) => {
    setActiveMarriageKey(unionKey);
    setIsMarriageModalOpen(true);
  }, []);

  const closeMarriageModal = useCallback(() => {
    setIsMarriageModalOpen(false);
    setActiveMarriageKey(null);
  }, []);

  // Update Marriage data
  const updateUnionData = useCallback((unionKey, data) => {
    setUnionsData(prev => ({
      ...prev,
      [unionKey]: {
        ...(prev[unionKey] || {}),
        ...data
      }
    }));
    closeMarriageModal();
  }, [closeMarriageModal]);

  // Open Detail / Profile Drawer
  const openDetail = useCallback((id) => {
    setSelectedMemberId(id);
    setPendingRelation(null);
    setSidebarOpen(false);
    setIsDetailDrawerOpen(true);
  }, []);

  // Open Quick Edit Sidebar
  const openEditSidebar = useCallback((id) => {
    setSelectedMemberId(id);
    setPendingRelation(null);
    setIsDetailDrawerOpen(false);
    setSidebarOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedMemberId(null);
    setPendingRelation(null);
    setSidebarOpen(false);
    setIsDetailDrawerOpen(false);
  }, []);

  // Open Add Modal
  const openAddModal = useCallback((relationCtx = null) => {
    setModalMode('add');
    setEditingMember(null);
    setAddRelationContext(relationCtx);
    setIsAddEditModalOpen(true);
  }, []);

  // Open Edit Modal
  const openEditModal = useCallback((member) => {
    setModalMode('edit');
    setEditingMember(member);
    setAddRelationContext(null);
    setIsAddEditModalOpen(true);
  }, []);

  const closeAddEditModal = useCallback(() => {
    setIsAddEditModalOpen(false);
    setEditingMember(null);
    setAddRelationContext(null);
  }, []);

  // Center canvas on a specific member node
  const focusOnMember = useCallback((id) => {
    const node = layout.nodes.find(n => n.id === id);
    if (node) {
      setHighlightedMemberId(id);
      setTimeout(() => setHighlightedMemberId(null), 3000);

      // Smooth pan to center
      const targetScale = 1.0;
      const targetX = window.innerWidth / 2 - (node.x + node.width / 2) * targetScale;
      const targetY = (window.innerHeight - 68) / 2 - (node.y + node.height / 2) * targetScale;

      setTransform({
        x: targetX,
        y: targetY,
        scale: targetScale
      });
    }
  }, [layout.nodes]);

  // Add Member Action
  const addMember = useCallback((newMemberData) => {
    const newId = Date.now().toString();
    const newMember = {
      ...newMemberData,
      id: newId,
      parents: [...(newMemberData.parents || [])],
      spouses: [...(newMemberData.spouses || [])],
      children: [...(newMemberData.children || [])]
    };

    setMembers(prev => {
      const updated = [...prev, newMember];

      // Update parent links (if this new member has parents, add this member to their children)
      if (newMember.parents.length > 0) {
        newMember.parents.forEach(pId => {
          const parent = updated.find(m => m.id === pId);
          if (parent && !parent.children.includes(newId)) {
            parent.children = [...parent.children, newId];
          }
        });
      }

      // Update spouse links
      if (newMember.spouses.length > 0) {
        newMember.spouses.forEach(sId => {
          const spouse = updated.find(m => m.id === sId);
          if (spouse && !spouse.spouses.includes(newId)) {
            spouse.spouses = [...spouse.spouses, newId];
          }
        });
      }

      // Update children links (if this new member is added as a parent of existing children)
      if (newMember.children.length > 0) {
        newMember.children.forEach(cId => {
          const child = updated.find(m => m.id === cId);
          if (child && !child.parents.includes(newId)) {
            child.parents = [...child.parents, newId];
          }
        });
      }

      return updated.map(m => ({ ...m }));
    });

    closeAddEditModal();
    focusOnMember(newId);

    // Confetti celebration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore confetti errors
    }
  }, [closeAddEditModal, focusOnMember]);

  // Update Member Action
  const updateMember = useCallback((updatedData) => {
    setMembers(prev => {
      const id = updatedData.id;
      const oldMember = prev.find(m => m.id === id);
      if (!oldMember) return prev;

      let updatedList = prev.map(m => (m.id === id ? { ...m, ...updatedData } : m));

      // Sync parents
      const oldParents = oldMember.parents || [];
      const newParents = updatedData.parents || [];
      oldParents.filter(pId => !newParents.includes(pId)).forEach(pId => {
        const p = updatedList.find(m => m.id === pId);
        if (p) p.children = p.children.filter(cId => cId !== id);
      });
      newParents.filter(pId => !oldParents.includes(pId)).forEach(pId => {
        const p = updatedList.find(m => m.id === pId);
        if (p && !p.children.includes(id)) p.children = [...p.children, id];
      });

      // Sync spouses
      const oldSpouses = oldMember.spouses || [];
      const newSpouses = updatedData.spouses || [];
      oldSpouses.filter(sId => !newSpouses.includes(sId)).forEach(sId => {
        const s = updatedList.find(m => m.id === sId);
        if (s) s.spouses = s.spouses.filter(xId => xId !== id);
      });
      newSpouses.filter(sId => !oldSpouses.includes(sId)).forEach(sId => {
        const s = updatedList.find(m => m.id === sId);
        if (s && !s.spouses.includes(id)) s.spouses = [...s.spouses, id];
      });

      // Sync children
      const oldChildren = oldMember.children || [];
      const newChildren = updatedData.children || [];
      oldChildren.filter(cId => !newChildren.includes(cId)).forEach(cId => {
        const c = updatedList.find(m => m.id === cId);
        if (c) c.parents = c.parents.filter(pId => pId !== id);
      });
      newChildren.filter(cId => !oldChildren.includes(cId)).forEach(cId => {
        const c = updatedList.find(m => m.id === cId);
        if (c && !c.parents.includes(id)) c.parents = [...c.parents, id];
      });

      return updatedList.map(m => ({ ...m }));
    });

    closeAddEditModal();
  }, [closeAddEditModal]);

  // Delete Member Action
  const deleteMember = useCallback((id) => {
    setMembers(prev => {
      return prev
        .filter(m => m.id !== id)
        .map(m => ({
          ...m,
          parents: (m.parents || []).filter(pId => pId !== id),
          spouses: (m.spouses || []).filter(sId => sId !== id),
          children: (m.children || []).filter(cId => cId !== id)
        }));
    });

    if (selectedMemberId === id) {
      closeDetail();
    }
  }, [selectedMemberId, closeDetail]);

  // Reset to single root
  const resetToSingleRoot = useCallback(() => {
    if (window.confirm("Barcha ma'lumotlarni tozalab, 1 ta boshlovchi shaxs bilan yangitdan boshlashni tasdiqlaysizmi?")) {
      setMembers(INITIAL_FAMILY_DATA);
      setUnionsData({});
      setCollapsedUnions(new Set());
      closeDetail();
    }
  }, [closeDetail]);

  // Load rich demo sample
  const loadDemoSample = useCallback(() => {
    if (window.confirm("Tayyor 4-avlod namunaviy genealogiya ma'lumotlarini yuklashni tasdiqlaysizmi?")) {
      setMembers(SAMPLE_DEMO_FAMILY_DATA);
      setUnionsData(DEMO_UNIONS_DATA);
      setCollapsedUnions(new Set());
      closeDetail();
    }
  }, [closeDetail]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const bundle = {
      members,
      unionsData,
      version: '1.0'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `oila_shajarasi_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [members, unionsData]);

  // Import JSON
  const importJSON = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setMembers(imported);
          alert(`Muvaffaqiyatli yuklandi! Jami ${imported.length} ta a'zo.`);
        } else if (imported.members && Array.isArray(imported.members)) {
          setMembers(imported.members);
          if (imported.unionsData) setUnionsData(imported.unionsData);
          alert(`Muvaffaqiyatli yuklandi! Jami ${imported.members.length} ta a'zo.`);
        } else {
          alert("Fayl formati noto'g'ri. Oila daraxti JSON faylini tanlang.");
        }
      } catch (err) {
        alert("Faylni o'qishda xatolik yuz berdi: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = members.length;
    const males = members.filter(m => m.gender === 'male').length;
    const females = members.filter(m => m.gender === 'female').length;
    const living = members.filter(m => m.isAlive).length;
    const deceased = total - living;

    const genSet = new Set();
    layout.nodes.forEach(n => genSet.add(n.generation || 1));
    const generationsCount = genSet.size || 1;

    const profMap = {};
    members.forEach(m => {
      if (m.profession) {
        const prof = m.profession.trim();
        profMap[prof] = (profMap[prof] || 0) + 1;
      }
    });

    const topProfessions = Object.entries(profMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return {
      total,
      males,
      females,
      living,
      deceased,
      generationsCount,
      topProfessions
    };
  }, [members, layout.nodes]);

  const value = {
    theme,
    toggleTheme,
    members,
    layout,
    transform,
    setTransform,
    selectedMember,
    selectedMemberId,
    setSelectedMemberId,
    sidebarOpen,
    setSidebarOpen,
    pendingRelation,
    setPendingRelation,
    highlightedMemberId,
    unionsData,
    collapsedUnions,
    toggleUnionCollapse,
    isMarriageModalOpen,
    activeMarriageKey,
    openMarriageModal,
    closeMarriageModal,
    updateUnionData,
    isDetailDrawerOpen,
    setIsDetailDrawerOpen,
    isAddEditModalOpen,
    isStatsModalOpen,
    setIsStatsModalOpen,
    modalMode,
    editingMember,
    addRelationContext,
    searchQuery,
    setSearchQuery,
    filterGen,
    setFilterGen,
    filterGender,
    setFilterGender,
    filterStatus,
    setFilterStatus,
    stats,
    openDetail,
    openEditSidebar,
    closeDetail,
    openAddModal,
    openEditModal,
    closeAddEditModal,
    focusOnMember,
    addMember,
    updateMember,
    deleteMember,
    resetToSingleRoot,
    loadDemoSample,
    exportJSON,
    importJSON
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
