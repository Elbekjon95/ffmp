import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';

export const ConnectionLines = () => {
  const {
    layout,
    members,
    selectedMemberId,
    toggleUnionCollapse,
    openMarriageModal
  } = useFamily();

  const { marriageLines, familyGroups, bounds } = layout;

  return (
    <>
      {/* SVG Layer for crisp minimalist blue genealogical lines */}
      <svg
        className="canvas-svg-layer"
        style={{
          width: Math.max(bounds.width + 2000, 4000),
          height: Math.max(bounds.height + 2000, 4000),
          overflow: 'visible'
        }}
      >
        {/* 1. Marriage Bridge Lines between Couples */}
        <g className="marriage-bridge-lines">
          {marriageLines.map(line => (
            <g key={`m_line_${line.id}`}>
              {/* Outer soft blue line */}
              <line
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke="rgba(2, 132, 199, 0.15)"
                strokeWidth={5}
              />
              {/* Crisp dashed sky blue line */}
              <line
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke="#0284c7"
                strokeWidth={2.2}
                strokeDasharray="4 3"
              />
            </g>
          ))}
        </g>

        {/* 2. Crisp Orthogonal Parent-to-Children Royal Blue Tree Lines */}
        <g className="orthogonal-family-groups">
          {familyGroups.map(group => (
            <g key={group.id}>
              {/* A. Outer Soft Blue Glow Layer */}
              <g stroke="rgba(37, 99, 235, 0.14)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
                {/* Vertical Trunk */}
                <line
                  x1={group.source.x}
                  y1={group.source.y}
                  x2={group.source.x}
                  y2={group.busY}
                />
                {/* Horizontal Bus Bar */}
                {group.busStart.x !== group.busEnd.x && (
                  <line
                    x1={group.busStart.x}
                    y1={group.busY}
                    x2={group.busEnd.x}
                    y2={group.busY}
                  />
                )}
                {/* Vertical Drops */}
                {group.children.map(child => (
                  <line
                    key={`glow_drop_${child.id}`}
                    x1={child.target.x}
                    y1={group.busY}
                    x2={child.target.x}
                    y2={child.target.y}
                  />
                ))}
              </g>

              {/* B. Sharp Solid Royal Blue Line Layer */}
              <g stroke="#2563eb" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
                {/* Vertical Trunk from parent to distributor bar */}
                <line
                  x1={group.source.x}
                  y1={group.source.y}
                  x2={group.source.x}
                  y2={group.busY}
                />

                {/* Horizontal Bus Distributor Bar */}
                {group.busStart.x !== group.busEnd.x && (
                  <line
                    x1={group.busStart.x}
                    y1={group.busY}
                    x2={group.busEnd.x}
                    y2={group.busY}
                  />
                )}

                {/* Vertical Drops to each child */}
                {group.children.map(child => (
                  <line
                    key={`sharp_drop_${child.id}`}
                    x1={child.target.x}
                    y1={group.busY}
                    x2={child.target.x}
                    y2={child.target.y}
                  />
                ))}
              </g>

              {/* C. Junction Dots */}
              <circle
                cx={group.source.x}
                cy={group.busY}
                r={3}
                fill="#2563eb"
              />

              {group.children.map(child => (
                <g key={`dot_${child.id}`}>
                  <circle
                    cx={child.target.x}
                    cy={group.busY}
                    r={2.5}
                    fill="#2563eb"
                  />
                  <circle
                    cx={child.target.x}
                    cy={child.target.y}
                    r={3.5}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                </g>
              ))}
            </g>
          ))}
        </g>

        {/* 3. Ghost Connections to Placeholder Cards (+ Add Father, + Add Mother, + Add Spouse, + Add Children) */}
        {selectedMemberId && (() => {
          const selNode = layout.nodes.find(n => n.id === selectedMemberId);
          if (!selNode) return null;

          const cx = selNode.x + 130;
          const ty = selNode.y;

          const fatherPinX = selNode.x + 20;
          const motherPinX = selNode.x + 240;
          const parentBarY = selNode.y - 20;
          const fatherCardBottomY = selNode.y - 39;

          // Check existing spouses for dynamic positioning
          const existingSpouses = (selNode.spouses || [])
            .map(id => layout.nodes.find(n => n.id === id))
            .filter(Boolean);

          // 2. Spouse line (Men on LEFT, Women on RIGHT)
          const isFemale = selNode.gender === 'female';
          const allAdultNodes = [selNode, ...existingSpouses];
          const minAdultX = Math.min(...allAdultNodes.map(a => a.x));
          const maxAdultX = Math.max(...allAdultNodes.map(a => a.x + 260));

          let spouseStartX, spouseTargetX, spouseStroke;
          const spouseY = selNode.y + 63;

          if (isFemale) {
            // Husband on LEFT
            spouseStartX = minAdultX;
            spouseTargetX = minAdultX - 50;
            spouseStroke = "#3b82f6";
          } else {
            // Wife on RIGHT
            spouseStartX = maxAdultX;
            spouseTargetX = maxAdultX + 50;
            spouseStroke = "#ec4899";
          }

          let childrenCenterX = cx;
          let childrenTopY = selNode.y + 126;

          if (existingSpouses.length > 0) {
            const primarySpouse = existingSpouses[0];
            const [leftN, rightN] = selNode.x < primarySpouse.x ? [selNode, primarySpouse] : [primarySpouse, selNode];
            childrenCenterX = (leftN.x + rightN.x + 260) / 2;
            childrenTopY = selNode.y + 63 + 18;
          }

          // 3. Children lines
          const allChildrenIds = new Set([
            ...(selNode.children || []),
            ...(selNode.spouses || []).flatMap(sId => layout.nodes.find(n => n.id === sId)?.children || [])
          ]);

          const directChildrenNodes = Array.from(allChildrenIds)
            .map(id => layout.nodes.find(n => n.id === id))
            .filter(Boolean);

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

          let sonPinX, daughterPinX, childBarY, childCardTopY;

          if (allChildFamilyUnits.length > 0) {
            const childY = allChildFamilyUnits[0].y;
            const minChildX = Math.min(...allChildFamilyUnits.map(c => c.x));
            const maxChildX = Math.max(...allChildFamilyUnits.map(c => c.x + 260));

            const sonX = minChildX - 180 - 50;
            const daughterX = maxChildX + 50;

            sonPinX = sonX + 90;
            daughterPinX = daughterX + 90;
            childCardTopY = childY + (120 - 56) / 2;
            childBarY = childrenTopY + (childY - childrenTopY) / 2;
          } else {
            sonPinX = childrenCenterX - 110;
            daughterPinX = childrenCenterX + 110;
            childBarY = selNode.y + 160;
            childCardTopY = selNode.y + 196;
          }

          // Check existing parents
          const fullMember = members.find(m => m.id === selectedMemberId);
          const existingParents = (fullMember?.parents || []).map(id => members.find(m => m.id === id)).filter(Boolean);
          const hasFather = existingParents.some(p => p.gender === 'male');
          const hasMother = existingParents.some(p => p.gender === 'female');

          return (
            <g className="ghost-connections" strokeDasharray="3 3" strokeWidth={1.8}>
              {/* Up to Parents (Only if at least one parent is missing) */}
              {(!hasFather || !hasMother) && (
                <>
                  <line x1={cx} y1={ty} x2={cx} y2={parentBarY} stroke="#94a3b8" />
                  <line
                    x1={!hasFather ? fatherPinX : cx}
                    y1={parentBarY}
                    x2={!hasMother ? motherPinX : cx}
                    y2={parentBarY}
                    stroke="#94a3b8"
                  />
                  {!hasFather && <line x1={fatherPinX} y1={parentBarY} x2={fatherPinX} y2={fatherCardBottomY} stroke="#3b82f6" />}
                  {!hasMother && <line x1={motherPinX} y1={parentBarY} x2={motherPinX} y2={fatherCardBottomY} stroke="#ec4899" />}
                </>
              )}

              {/* Side to Spouse */}
              {existingSpouses.length < 3 && (
                <line x1={spouseStartX} y1={spouseY} x2={spouseTargetX} y2={spouseY} stroke={spouseStroke} />
              )}

              {/* Down to Children */}
              <line x1={childrenCenterX} y1={childrenTopY} x2={childrenCenterX} y2={childBarY} stroke="#94a3b8" />
              <line x1={sonPinX} y1={childBarY} x2={daughterPinX} y2={childBarY} stroke="#94a3b8" />
              <line x1={sonPinX} y1={childBarY} x2={sonPinX} y2={childCardTopY} stroke="#3b82f6" />
              <line x1={daughterPinX} y1={childBarY} x2={daughterPinX} y2={childCardTopY} stroke="#ec4899" />
            </g>
          );
        })()}
      </svg>

      {/* HTML Interactive Marriage Nodes & Collapse Controls */}
      <div className="canvas-marriage-nodes-layer" style={{ position: 'absolute', top: 0, left: 0, zIndex: 25, pointerEvents: 'auto' }}>
        {marriageLines.map(line => {
          const hasChildren = line.childCount > 0;
          const isCollapsed = line.isCollapsed;

          return (
            <div
              key={`m_node_${line.id}`}
              className="marriage-interactive-node"
              style={{
                position: 'absolute',
                left: `${line.midX}px`,
                top: `${line.midY}px`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4
              }}
            >
              {/* Marriage Date Badge (Click to edit date/info) */}
              <button
                className="marriage-date-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  openMarriageModal(line.id);
                }}
                title="Nikoh sanasini kiritish / tahrirlash"
              >
                <Heart size={10} fill="var(--color-blue)" color="var(--color-blue)" />
                <span>{line.date ? `${line.date}` : '+ Sana'}</span>
              </button>

              {/* Central Marriage Ring Button */}
              <div
                className="marriage-ring-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren) {
                    toggleUnionCollapse(line.id);
                  } else {
                    openMarriageModal(line.id);
                  }
                }}
                title={hasChildren ? (isCollapsed ? "Pastki avlodni ochish" : "Pastki avlodni yopish") : "Nikoh ma'lumotlari"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="12" r="5.5" stroke="#2563eb" strokeWidth="2.2" />
                  <circle cx="15" cy="12" r="5.5" stroke="#2563eb" strokeWidth="2.2" />
                </svg>
              </div>

              {/* Branch Fold/Unfold Button if has children */}
              {hasChildren && (
                <button
                  className={`marriage-collapse-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUnionCollapse(line.id);
                  }}
                  title={isCollapsed ? `Pastki avlodni ochish (${line.childCount} ta farzand)` : "Pastki avlodni yopish"}
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown size={11} />
                      <span>{line.childCount}</span>
                    </>
                  ) : (
                    <ChevronUp size={11} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
