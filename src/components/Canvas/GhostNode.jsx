import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Plus } from 'lucide-react';
import { NODE_WIDTH } from '../../utils/treeLayout';

export const GHOST_WIDTH = 180;
export const GHOST_HEIGHT = 56;

export const GhostNodes = () => {
  const {
    selectedMemberId,
    layout,
    members,
    setPendingRelation,
    setSidebarOpen,
    setIsDetailDrawerOpen
  } = useFamily();

  if (!selectedMemberId) return null;

  const node = layout.nodes.find(n => n.id === selectedMemberId);
  if (!node) return null;

  const fullMember = members.find(m => m.id === selectedMemberId);
  if (!fullMember) return null;

  const isFemale = fullMember.gender === 'female';

  // Check existing parents, spouses and children
  const existingParents = (fullMember.parents || []).map(id => members.find(m => m.id === id)).filter(Boolean);
  const hasFather = existingParents.some(p => p.gender === 'male');
  const hasMother = existingParents.some(p => p.gender === 'female');

  const existingSpouseNodes = (fullMember.spouses || [])
    .map(id => layout.nodes.find(n => n.id === id))
    .filter(Boolean);

  const handleGhostClick = (relationType, e) => {
    e.stopPropagation();
    setIsDetailDrawerOpen(false);
    setPendingRelation({
      relativeId: node.id,
      relationType
    });
    setSidebarOpen(true);
  };

  // 1. Parents positions (Father on Left, Mother on Right)
  const nodeCenterX = node.x + NODE_WIDTH / 2;

  const fatherPos = {
    x: nodeCenterX - 110 - GHOST_WIDTH / 2,
    y: node.y - 95
  };

  const motherPos = {
    x: nodeCenterX + 110 - GHOST_WIDTH / 2,
    y: node.y - 95
  };

  // 2. Spouse position (Men on LEFT, Women on RIGHT of all adults)
  const allAdultNodes = [node, ...existingSpouseNodes];
  const minAdultX = Math.min(...allAdultNodes.map(a => a.x));
  const maxAdultX = Math.max(...allAdultNodes.map(a => a.x + NODE_WIDTH));

  let spousePos;
  if (isFemale) {
    // Husband goes on the LEFT
    spousePos = {
      x: minAdultX - GHOST_WIDTH - 50,
      y: node.y + 35
    };
  } else {
    // Wife goes on the RIGHT
    spousePos = {
      x: maxAdultX + 50,
      y: node.y + 35
    };
  }

  // 3. Children positions (Include direct children AND their spouses)
  const allChildrenIds = new Set([
    ...(fullMember.children || []),
    ...(fullMember.spouses || []).flatMap(sId => members.find(m => m.id === sId)?.children || [])
  ]);

  const directChildrenNodes = Array.from(allChildrenIds)
    .map(id => layout.nodes.find(n => n.id === id))
    .filter(Boolean);

  // Collect children + their spouses in the children generation row
  const allChildFamilyUnits = [];
  directChildrenNodes.forEach(child => {
    allChildFamilyUnits.push(child);
    const fullChild = members.find(m => m.id === child.id);
    (fullChild?.spouses || []).forEach(sId => {
      const sNode = layout.nodes.find(n => n.id === sId);
      if (sNode && !allChildFamilyUnits.some(u => u.id === sNode.id)) {
        allChildFamilyUnits.push(sNode);
      }
    });
  });

  let sonPos, daughterPos;

  if (allChildFamilyUnits.length > 0) {
    // Position Son to the far left of children row, Daughter to the far right!
    const childY = allChildFamilyUnits[0].y;
    const minChildX = Math.min(...allChildFamilyUnits.map(c => c.x));
    const maxChildX = Math.max(...allChildFamilyUnits.map(c => c.x + NODE_WIDTH));

    sonPos = {
      x: minChildX - GHOST_WIDTH - 50,
      y: childY + (120 - GHOST_HEIGHT) / 2
    };

    daughterPos = {
      x: maxChildX + 50,
      y: childY + (120 - GHOST_HEIGHT) / 2
    };
  } else {
    // No children yet: position symmetrically below parent(s)
    let childrenCenterX = nodeCenterX;
    if (existingSpouseNodes.length > 0) {
      const primarySpouse = existingSpouseNodes[0];
      const [leftN, rightN] = node.x < primarySpouse.x ? [node, primarySpouse] : [primarySpouse, node];
      childrenCenterX = (leftN.x + rightN.x + NODE_WIDTH) / 2;
    }

    sonPos = {
      x: childrenCenterX - 110 - GHOST_WIDTH / 2,
      y: node.y + 196
    };

    daughterPos = {
      x: childrenCenterX + 110 - GHOST_WIDTH / 2,
      y: node.y + 196
    };
  }

  return (
    <div className="ghost-nodes-container" style={{ position: 'absolute', top: 0, left: 0, zIndex: 35, pointerEvents: 'none' }}>
      {/* 1. Ghost Father (Male - Left) */}
      {!hasFather && (
        <div
          className="ghost-card ghost-male"
          style={{
            left: `${fatherPos.x}px`,
            top: `${fatherPos.y}px`,
            width: `${GHOST_WIDTH}px`,
            height: `${GHOST_HEIGHT}px`,
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleGhostClick('father', e)}
          title="Ota qo'shish (Add Father)"
        >
          <div className="ghost-plus-icon male-plus">
            <Plus size={18} />
          </div>
          <span className="ghost-label male-label">Add Father</span>
        </div>
      )}

      {/* 2. Ghost Mother (Female - Right) */}
      {!hasMother && (
        <div
          className="ghost-card ghost-female"
          style={{
            left: `${motherPos.x}px`,
            top: `${motherPos.y}px`,
            width: `${GHOST_WIDTH}px`,
            height: `${GHOST_HEIGHT}px`,
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleGhostClick('mother', e)}
          title="Ona qo'shish (Add Mother)"
        >
          <div className="ghost-plus-icon female-plus">
            <Plus size={18} />
          </div>
          <span className="ghost-label female-label">Add Mother</span>
        </div>
      )}

      {/* 3. Ghost Spouse (Er yoki Xotin qo'shish) */}
      {existingSpouseNodes.length < 3 && (
        <div
          className={`ghost-card ${isFemale ? 'ghost-male' : 'ghost-female'}`}
          style={{
            left: `${spousePos.x}px`,
            top: `${spousePos.y}px`,
            width: `${GHOST_WIDTH}px`,
            height: `${GHOST_HEIGHT}px`,
            pointerEvents: 'auto'
          }}
          onClick={(e) => handleGhostClick('spouse', e)}
          title={isFemale ? "Er qo'shish (Add Husband)" : "Xotin qo'shish (Add Wife)"}
        >
          <div className={`ghost-plus-icon ${isFemale ? 'male-plus' : 'female-plus'}`}>
            <Plus size={18} />
          </div>
          <span className={`ghost-label ${isFemale ? 'male-label' : 'female-label'}`}>
            {isFemale ? 'Add Husband' : 'Add Wife'}
          </span>
        </div>
      )}

      {/* 4. Ghost Son (Male - Left) */}
      <div
        className="ghost-card ghost-male"
        style={{
          left: `${sonPos.x}px`,
          top: `${sonPos.y}px`,
          width: `${GHOST_WIDTH}px`,
          height: `${GHOST_HEIGHT}px`,
          pointerEvents: 'auto'
        }}
        onClick={(e) => handleGhostClick('son', e)}
        title="O'g'il farzand qo'shish (Add Son)"
      >
        <div className="ghost-plus-icon male-plus">
          <Plus size={18} />
        </div>
        <span className="ghost-label male-label">Add Son</span>
      </div>

      {/* 5. Ghost Daughter (Female - Right) */}
      <div
        className="ghost-card ghost-female"
        style={{
          left: `${daughterPos.x}px`,
          top: `${daughterPos.y}px`,
          width: `${GHOST_WIDTH}px`,
          height: `${GHOST_HEIGHT}px`,
          pointerEvents: 'auto'
        }}
        onClick={(e) => handleGhostClick('daughter', e)}
        title="Qiz farzand qo'shish (Add Daughter)"
      >
        <div className="ghost-plus-icon female-plus">
          <Plus size={18} />
        </div>
        <span className="ghost-label female-label">Add Daughter</span>
      </div>
    </div>
  );
};
