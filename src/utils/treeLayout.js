/**
 * Family Tree Layout Engine
 * Computes 2D coordinates (x, y) for nodes and crisp genealogical connection paths.
 */

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 126;
export const SPOUSE_GAP = 96;
export const SIBLING_GAP = 60;
export const FAMILY_GAP = 90;
export const LEVEL_GAP = 140;

/**
 * Calculates generation levels for all members
 */
export function calculateGenerations(members) {
  const memberMap = new Map(members.map(m => [m.id, { ...m }]));
  const generations = new Map();

  function getGen(id, visited = new Set()) {
    if (visited.has(id)) return 1;
    visited.add(id);

    if (generations.has(id)) return generations.get(id);

    const member = memberMap.get(id);
    if (!member) return 1;

    const parentGens = (member.parents || [])
      .map(pId => getGen(pId, new Set(visited)))
      .filter(g => g !== undefined);

    let gen = 1;
    if (parentGens.length > 0) {
      gen = Math.max(...parentGens) + 1;
    } else if (member.spouses && member.spouses.length > 0) {
      for (const sId of member.spouses) {
        const spouse = memberMap.get(sId);
        if (spouse && spouse.parents && spouse.parents.length > 0 && !visited.has(sId)) {
          const spouseGen = getGen(sId, new Set(visited));
          if (spouseGen > 1) {
            gen = spouseGen;
            break;
          }
        }
      }
    }

    generations.set(id, gen);
    return gen;
  }

  members.forEach(m => getGen(m.id));

  // Align spouses to the exact same generation level
  members.forEach(m => {
    if (m.spouses && m.spouses.length > 0) {
      const g1 = generations.get(m.id) || 1;
      for (const sId of m.spouses) {
        const g2 = generations.get(sId) || 1;
        const maxG = Math.max(g1, g2);
        generations.set(m.id, maxG);
        generations.set(sId, maxG);
      }
    }
  });

  return generations;
}

/**
 * Recursively mark all descendants and their spouses as visited/hidden
 */
function markAllDescendantsAsVisited(memberId, memberMap, visitedSet) {
  const m = memberMap.get(memberId);
  if (!m) return;
  visitedSet.add(m.id);

  (m.spouses || []).forEach(sId => visitedSet.add(sId));

  const allChildren = [
    ...(m.children || []),
    ...(m.spouses || []).flatMap(sId => memberMap.get(sId)?.children || [])
  ];

  allChildren.forEach(cId => {
    if (!visitedSet.has(cId)) {
      markAllDescendantsAsVisited(cId, memberMap, visitedSet);
    }
  });
}

/**
 * Main Layout Engine
 */
export function calculateTreeLayout(members, collapsedUnions = new Set(), unionsData = {}, selectedMemberId = null) {
  if (!members || members.length === 0) {
    return {
      nodes: [],
      marriageLines: [],
      familyGroups: [],
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
    };
  }

  const memberMap = new Map(members.map(m => [m.id, { ...m }]));
  const generations = calculateGenerations(members);

  const levels = new Map();
  members.forEach(m => {
    const gen = generations.get(m.id) || 1;
    if (!levels.has(gen)) levels.set(gen, []);
    levels.get(gen).push(m);
  });

  const nodePositions = new Map();
  const processedCouples = new Set();
  const marriageNodes = [];

  const getMarriageKey = (id1, id2) => [id1, id2].sort().join('___');
  const visitedNodes = new Set();

  function layoutFamilySubtree(rootId, startX, gen) {
    if (visitedNodes.has(rootId)) return { width: 0, center: startX };
    const member = memberMap.get(rootId);
    if (!member) return { width: 0, center: startX };

    visitedNodes.add(rootId);

    // Find spouses
    const spouses = (member.spouses || [])
      .map(sId => memberMap.get(sId))
      .filter(s => s && !visitedNodes.has(s.id));

    spouses.forEach(s => visitedNodes.add(s.id));

    const y = (gen - 1) * (NODE_HEIGHT + LEVEL_GAP) + 80;

    // Check if this union is collapsed
    const primarySpouse = spouses[0];
    const unionKey = primarySpouse ? getMarriageKey(member.id, primarySpouse.id) : null;
    const isCollapsed = unionKey ? collapsedUnions.has(unionKey) : false;

    // Gather all direct children
    const allChildrenIds = new Set([
      ...(member.children || []),
      ...spouses.flatMap(s => s.children || [])
    ]);

    const directChildrenList = Array.from(allChildrenIds)
      .map(cId => memberMap.get(cId))
      .filter(c => c !== undefined);

    const childCount = directChildrenList.length;

    // If collapsed: Mark all children and sub-descendants as visited so they are not rendered or picked up as orphan roots!
    if (isCollapsed) {
      directChildrenList.forEach(child => {
        markAllDescendantsAsVisited(child.id, memberMap, visitedNodes);
      });
    }

    const childrenToLayout = isCollapsed
      ? []
      : directChildrenList.filter(c => !visitedNodes.has(c.id));

    // Calculate ghost nodes expansion if this family contains selectedMemberId
    const allAdultsTemp = [member, ...spouses];
    const selectedAdult = selectedMemberId ? allAdultsTemp.find(a => a.id === selectedMemberId) : null;

    let extraLeft = 0;
    let extraRight = 0;

    if (selectedAdult) {
      // 1. Ghost Spouse (+ Add Wife / + Add Husband)
      const canAddSpouse = (selectedAdult.spouses || []).length < 3;
      if (canAddSpouse) {
        if (selectedAdult.gender === 'female') {
          extraLeft = Math.max(extraLeft, 250);
        } else {
          extraRight = Math.max(extraRight, 250);
        }
      }

      // 2. Ghost Children (+ Add Son / + Add Daughter)
      const hasChildren = allChildrenIds.size > 0;
      if (!hasChildren) {
        if (spouses.length === 0) {
          extraLeft = Math.max(extraLeft, 70);
          extraRight = Math.max(extraRight, 70);
        }
      } else {
        extraLeft = Math.max(extraLeft, 240);
        extraRight = Math.max(extraRight, 240);
      }

      // 3. Ghost Parents (+ Add Father / + Add Mother)
      const parentIds = selectedAdult.parents || [];
      if (parentIds.length < 2 && spouses.length === 0) {
        extraLeft = Math.max(extraLeft, 70);
        extraRight = Math.max(extraRight, 70);
      }
    }

    // Layout children subtrees first (offset by extraLeft)
    let childrenWidth = 0;
    let childrenStartX = startX + extraLeft;
    const childCenters = [];

    if (childrenToLayout.length > 0) {
      childrenToLayout.forEach((child, idx) => {
        const childRes = layoutFamilySubtree(child.id, childrenStartX, gen + 1);
        childCenters.push({ id: child.id, center: childRes.center, width: childRes.width });
        childrenStartX += childRes.width + (idx < childrenToLayout.length - 1 ? SIBLING_GAP : 0);
      });
      childrenWidth = Math.max(0, childrenStartX - (startX + extraLeft));
    }

    // Couple width
    const totalAdults = 1 + spouses.length;
    const coupleWidth = totalAdults * NODE_WIDTH + (totalAdults - 1) * SPOUSE_GAP;

    const rawContentWidth = Math.max(coupleWidth, childrenWidth);
    let coupleStartX = startX + extraLeft;

    if (childrenWidth > coupleWidth) {
      coupleStartX = startX + extraLeft + (childrenWidth - coupleWidth) / 2;
    } else if (childrenToLayout.length > 0 && coupleWidth > childrenWidth) {
      const shiftX = (coupleWidth - childrenWidth) / 2;
      childCenters.forEach(c => {
        shiftSubtree(c.id, shiftX);
      });
    }

    // Order adults so Male is on the LEFT and Female is on the RIGHT
    const allAdults = [member, ...spouses];
    allAdults.sort((a, b) => {
      if (a.gender === 'male' && b.gender === 'female') return -1;
      if (a.gender === 'female' && b.gender === 'male') return 1;
      return 0;
    });

    // Position member & spouses
    let currentAdultX = coupleStartX;
    allAdults.forEach(adult => {
      nodePositions.set(adult.id, {
        ...adult,
        x: currentAdultX,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        generation: gen
      });
      currentAdultX += NODE_WIDTH + SPOUSE_GAP;
    });

    // Register marriage connections
    allAdults.forEach(adult => {
      (adult.spouses || []).forEach(sId => {
        const s = memberMap.get(sId);
        if (s && allAdults.some(a => a.id === s.id)) {
          const mKey = getMarriageKey(adult.id, s.id);
          if (!processedCouples.has(mKey)) {
            processedCouples.add(mKey);
            const uData = unionsData[mKey] || {};
            marriageNodes.push({
              id: mKey,
              spouse1Id: adult.id,
              spouse2Id: s.id,
              spouse1: adult,
              spouse2: s,
              date: uData.date || '',
              place: uData.place || '',
              note: uData.note || '',
              isCollapsed: collapsedUnions.has(mKey),
              childCount
            });
          }
        }
      });
    });

    const subtreeWidth = rawContentWidth + extraLeft + extraRight;
    const coupleCenter = coupleStartX + coupleWidth / 2;
    return { width: subtreeWidth, center: coupleCenter };
  }

  function shiftSubtree(nodeId, dx, visited = new Set()) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodePositions.get(nodeId);
    if (!node) return;
    node.x += dx;

    if (node.spouses) {
      node.spouses.forEach(sId => {
        if (!visited.has(sId)) {
          visited.add(sId);
          const sNode = nodePositions.get(sId);
          if (sNode) sNode.x += dx;
        }
      });
    }

    if (node.children) {
      node.children.forEach(cId => shiftSubtree(cId, dx, visited));
    }
  }

  // Iterate roots
  const sortedGens = Array.from(levels.keys()).sort((a, b) => a - b);
  let currentStartX = 100;

  sortedGens.forEach(gen => {
    const genMembers = levels.get(gen) || [];
    genMembers.forEach(m => {
      if (!visitedNodes.has(m.id) && (!m.parents || m.parents.length === 0)) {
        const res = layoutFamilySubtree(m.id, currentStartX, gen);
        currentStartX += res.width + FAMILY_GAP;
      }
    });
  });

  // Catch unvisited (only truly independent unvisited nodes, never collapsed descendants)
  members.forEach(m => {
    if (!visitedNodes.has(m.id)) {
      const gen = generations.get(m.id) || 1;
      const res = layoutFamilySubtree(m.id, currentStartX, gen);
      currentStartX += res.width + FAMILY_GAP;
    }
  });

  // Clean shifted flags
  const finalNodes = Array.from(nodePositions.values()).map(n => {
    delete n.__shifted;
    return n;
  });

  // Re-sync marriage nodes with final shifted node positions
  const finalMarriageLines = marriageNodes.map(m => {
    const p1 = nodePositions.get(m.spouse1Id);
    const p2 = nodePositions.get(m.spouse2Id);
    if (p1 && p2) {
      const [leftNode, rightNode] = p1.x < p2.x ? [p1, p2] : [p2, p1];
      const midX = (leftNode.x + NODE_WIDTH + rightNode.x) / 2;
      const midY = leftNode.y + NODE_HEIGHT / 2;
      return {
        ...m,
        midX,
        midY,
        from: { x: leftNode.x + NODE_WIDTH, y: midY },
        to: { x: rightNode.x, y: midY }
      };
    }
    return m;
  });

  // Build clean, orthogonal lineage bus lines (Parents -> Children)
  const finalFamilyGroups = [];
  const processedFamilyUnits = new Set();

  finalNodes.forEach(node => {
    if (node.children && node.children.length > 0) {
      const primarySpouseId = (node.spouses && node.spouses[0]) || null;
      const unitKey = primarySpouseId
        ? getMarriageKey(node.id, primarySpouseId)
        : `single_${node.id}`;

      if (!processedFamilyUnits.has(unitKey)) {
        processedFamilyUnits.add(unitKey);

        const isUnitCollapsed = primarySpouseId && collapsedUnions.has(unitKey);

        if (!isUnitCollapsed) {
          let sourceX, sourceY, parentBottomY;
          const spouseNode = primarySpouseId ? nodePositions.get(primarySpouseId) : null;

          if (spouseNode) {
            const [leftNode, rightNode] = node.x < spouseNode.x ? [node, spouseNode] : [spouseNode, node];
            sourceX = (leftNode.x + NODE_WIDTH + rightNode.x) / 2;
            sourceY = leftNode.y + NODE_HEIGHT / 2 + 18;
            parentBottomY = leftNode.y + NODE_HEIGHT;
          } else {
            sourceX = node.x + NODE_WIDTH / 2;
            sourceY = node.y + NODE_HEIGHT;
            parentBottomY = node.y + NODE_HEIGHT;
          }

          // Find active rendered children
          const allChildren = new Set([
            ...node.children,
            ...(spouseNode ? spouseNode.children || [] : [])
          ]);

          const renderedChildren = Array.from(allChildren)
            .map(cId => nodePositions.get(cId))
            .filter(Boolean);

          if (renderedChildren.length > 0) {
            // Bus bar Y: exactly halfway between parent card bottom and child card top
            const firstChild = renderedChildren[0];
            const busY = parentBottomY + (firstChild.y - parentBottomY) / 2;

            const childXs = renderedChildren.map(c => c.x + NODE_WIDTH / 2);
            const minChildX = Math.min(...childXs, sourceX);
            const maxChildX = Math.max(...childXs, sourceX);

            finalFamilyGroups.push({
              id: `bus_${unitKey}`,
              unitKey,
              source: { x: sourceX, y: sourceY },
              busY,
              busStart: { x: minChildX, y: busY },
              busEnd: { x: maxChildX, y: busY },
              children: renderedChildren.map(c => ({
                id: c.id,
                target: { x: c.x + NODE_WIDTH / 2, y: c.y }
              }))
            });
          }
        }
      }
    }
  });

  // Calculate bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  finalNodes.forEach(n => {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x + NODE_WIDTH);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y + NODE_HEIGHT);
  });

  if (selectedMemberId && nodePositions.has(selectedMemberId)) {
    const sel = nodePositions.get(selectedMemberId);
    minX = Math.min(minX, sel.x - 260);
    maxX = Math.max(maxX, sel.x + NODE_WIDTH + 260);
    minY = Math.min(minY, sel.y - 120);
    maxY = Math.max(maxY, sel.y + NODE_HEIGHT + 220);
  }

  if (minX === Infinity) {
    minX = 0; maxX = 800; minY = 0; maxY = 600;
  }

  const padding = 140;
  const bounds = {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  };

  return {
    nodes: finalNodes,
    marriageLines: finalMarriageLines,
    familyGroups: finalFamilyGroups,
    bounds
  };
}
