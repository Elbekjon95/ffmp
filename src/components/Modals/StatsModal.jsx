import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { 
  X, 
  BarChart3, 
  Users, 
  Layers, 
  Heart, 
  Briefcase, 
  ShieldCheck 
} from 'lucide-react';

export const StatsModal = () => {
  const { isStatsModalOpen, setIsStatsModalOpen, stats } = useFamily();

  if (!isStatsModalOpen) return null;

  const malePercent = stats.total > 0 ? Math.round((stats.males / stats.total) * 100) : 0;
  const femalePercent = stats.total > 0 ? Math.round((stats.females / stats.total) * 100) : 0;
  const livingPercent = stats.total > 0 ? Math.round((stats.living / stats.total) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={() => setIsStatsModalOpen(false)}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={22} color="var(--color-emerald)" />
            <span>Sulola Statistikasi va Tahlili</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setIsStatsModalOpen(false)} title="Yopish">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Main 4 Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {/* Total Members */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-emerald)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>JAMI A'ZOLAR</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.total} nafar</div>
              </div>
            </div>

            {/* Generations */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                <Layers size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVLODLAR SONI</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)' }}>{stats.generationsCount} avlod</div>
              </div>
            </div>

            {/* Men */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)' }}>
                <ShieldCheck size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ERKAKLAR</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.males} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({malePercent}%)</span>
                </div>
              </div>
            </div>

            {/* Women */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-rose)' }}>
                <Heart size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AYOLLAR</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stats.females} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({femalePercent}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Living vs Deceased Bar */}
          <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600 }}>
              <span>Hayot: <strong style={{ color: 'var(--color-emerald)' }}>{stats.living} nafar ({livingPercent}%)</strong></span>
              <span>Vafot etgan: <strong style={{ color: 'var(--text-muted)' }}>{stats.deceased} nafar ({100 - livingPercent}%)</strong></span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${livingPercent}%`, background: 'var(--color-emerald)', transition: 'width 0.5s ease' }} />
              <div style={{ width: `${100 - livingPercent}%`, background: 'var(--text-muted)', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Top Professions */}
          {stats.topProfessions && stats.topProfessions.length > 0 && (
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={15} />
                <span>Sulolada Ko'p Uchraydigan Kasb va Yo'nalishlar</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stats.topProfessions.map(([prof, count]) => (
                  <span
                    key={prof}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>{prof}</span>
                    <strong style={{ color: 'var(--color-emerald)' }}>({count})</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setIsStatsModalOpen(false)}>
            Tushunarli
          </button>
        </div>
      </div>
    </div>
  );
};
