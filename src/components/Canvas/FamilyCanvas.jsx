import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { ConnectionLines } from './ConnectionLines';
import { MemberNode } from './MemberNode';
import { GhostNodes } from './GhostNode';
import { CanvasControls } from './CanvasControls';

export const FamilyCanvas = () => {
  const { layout, transform, setTransform, closeDetail } = useFamily();
  const wrapperRef = useRef(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Fit whole tree into viewport
  const fitView = useCallback(() => {
    if (!wrapperRef.current || !layout.bounds) return;
    const { width: viewW, height: viewH } = wrapperRef.current.getBoundingClientRect();
    const { minX, maxX, minY, maxY, width: treeW, height: treeH } = layout.bounds;

    if (treeW <= 0 || treeH <= 0) return;

    const scaleX = (viewW - 100) / treeW;
    const scaleY = (viewH - 100) / treeH;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.1);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetX = viewW / 2 - centerX * newScale;
    const targetY = viewH / 2 - centerY * newScale;

    setTransform({
      x: targetX,
      y: Math.max(targetY, 40),
      scale: newScale
    });
  }, [layout.bounds, setTransform]);

  const hasInitialFitRef = useRef(false);

  // Initial fit view on load
  useEffect(() => {
    if (!hasInitialFitRef.current && layout.nodes.length > 0) {
      hasInitialFitRef.current = true;
      const timer = setTimeout(() => {
        fitView();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [layout.nodes.length, fitView]);

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    // Only pan if clicking on background or svg
    if (
      e.target.closest('.member-node') || 
      e.target.closest('.ghost-card') || 
      e.target.closest('.canvas-controls') || 
      e.target.closest('.canvas-legend') ||
      e.target.closest('.marriage-interactive-node')
    ) {
      return;
    }

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
      clientX: e.clientX,
      clientY: e.clientY
    };
    setIsPanning(true);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const dx = Math.abs(e.clientX - dragStartRef.current.clientX);
    const dy = Math.abs(e.clientY - dragStartRef.current.clientY);
    if (dx > 5 || dy > 5) {
      hasMovedRef.current = true;
    }

    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const handleMouseUp = () => {
    // Only close/deselect if user did a simple single click on empty background without panning/dragging
    if (isDraggingRef.current && !hasMovedRef.current) {
      closeDetail();
    }
    isDraggingRef.current = false;
    setIsPanning(false);
  };

  // Wheel zoom around mouse pointer
  const handleWheel = (e) => {
    e.preventDefault();
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.18), 2.5);

    // Keep point under mouse steady
    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({
      x: newX,
      y: newY,
      scale: newScale
    });
  };

  // Touch drag handlers
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      touchStartRef.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y
      };
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      setTransform(prev => ({
        ...prev,
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y
      }));
    } else if (e.touches.length === 2 && touchDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const zoomFactor = newDist / touchDistRef.current;
      touchDistRef.current = newDist;

      setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * zoomFactor, 0.18), 2.5)
      }));
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistRef.current = null;
  };

  return (
    <div
      ref={wrapperRef}
      id="family-canvas-wrapper"
      className="canvas-wrapper"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={fitView}
    >
      {/* Background Dots */}
      <div className="canvas-grid-bg" />

      {/* Transformable Canvas World */}
      <div
        id="family-canvas-world"
        className="canvas-world"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isPanning ? 'none' : 'transform 0.05s ease-out'
        }}
      >
        {/* Connection Lines Layer (SVG) */}
        <ConnectionLines />

        {/* Nodes Layer (HTML) */}
        <div className="canvas-nodes-layer">
          {layout.nodes.map(node => (
            <MemberNode key={node.id} node={node} />
          ))}

          {/* Ghost Nodes around selected member */}
          <GhostNodes />
        </div>
      </div>

      {/* Floating Canvas Controls */}
      <CanvasControls onFitView={fitView} />
    </div>
  );
};
