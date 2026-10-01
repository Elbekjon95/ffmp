import React, { useState, useEffect } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Crosshair
} from 'lucide-react';

export const CanvasControls = ({ onFitView }) => {
  const { transform, setTransform } = useFamily();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Zoom handlers
  const handleZoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 2.5)
    }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.2)
    }));
  };

  const handleResetZoom = () => {
    setTransform(prev => ({
      ...prev,
      scale: 1.0
    }));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <>
      {/* Floating Canvas Controls */}
      <div className="canvas-controls">
        <button 
          className="control-btn" 
          onClick={handleZoomIn} 
          title="Kattalashtirish (Zoom In)"
        >
          <ZoomIn size={18} />
        </button>

        <span className="zoom-level-text" title="Joriy masshtab">
          {Math.round(transform.scale * 100)}%
        </span>

        <button 
          className="control-btn" 
          onClick={handleZoomOut} 
          title="Kichiklashtirish (Zoom Out)"
        >
          <ZoomOut size={18} />
        </button>

        <div className="control-divider" />

        <button 
          className="control-btn" 
          onClick={handleResetZoom} 
          title="100% masshtabga qaytarish"
        >
          <RotateCcw size={16} />
        </button>

        <button 
          className="control-btn" 
          onClick={onFitView} 
          title="Daraxtni ekranga moslashtirish (Fit View)"
        >
          <Crosshair size={18} />
        </button>

        <div className="control-divider" />

        <button 
          className="control-btn" 
          onClick={toggleFullscreen} 
          title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran rejimiga o'tish"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="canvas-legend">
          <div className="legend-item" title="Ota-onadan farzandga nasl chizig'i">
            <div className="legend-line-blood" />
            <span>Nasl rishtasi</span>
          </div>
          <div className="legend-item" title="Er-xotin nikoh rishtasi">
            <div className="legend-line-marriage" />
            <span>Nikoh rishtasi</span>
          </div>
          <button 
            className="btn-icon" 
            style={{ width: 22, height: 22, border: 'none', background: 'transparent' }} 
            onClick={() => setShowLegend(false)}
            title="Yashirish"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};
