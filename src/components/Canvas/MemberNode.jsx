import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { 
  UserPlus, 
  Edit3, 
  Eye,
  MapPin, 
  Briefcase, 
  Calendar
} from 'lucide-react';

export const MemberNode = ({ node }) => {
  const {
    selectedMemberId,
    highlightedMemberId,
    openDetail,
    openEditSidebar,
    openAddModal,
    searchQuery,
    filterGen,
    filterGender,
    filterStatus
  } = useFamily();

  const isSelected = selectedMemberId === node.id;
  const isHighlighted = highlightedMemberId === node.id;

  // Check matching filters
  const matchesSearch = !searchQuery || 
    `${node.firstName} ${node.lastName} ${node.profession || ''} ${node.birthPlace || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  const matchesGen = filterGen === 'all' || node.generation.toString() === filterGen;
  const matchesGender = filterGender === 'all' || node.gender === filterGender;
  const matchesStatus = filterStatus === 'all' || (filterStatus === 'alive' ? node.isAlive : !node.isAlive);

  const isVisible = matchesSearch && matchesGen && matchesGender && matchesStatus;

  // Format years
  const getYearsText = () => {
    const birth = node.birthDate ? node.birthDate.slice(0, 4) : '?';
    if (node.isAlive) {
      return `${birth} - hozirgacha`;
    }
    const death = node.deathDate ? node.deathDate.slice(0, 4) : '?';
    return `${birth} - ${death}`;
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    openEditSidebar(node.id);
  };

  return (
    <div
      id={`member-node-${node.id}`}
      className={`member-node gender-${node.gender} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        opacity: isVisible ? 1 : 0.25,
        filter: isVisible ? 'none' : 'grayscale(70%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, box-shadow 0.2s ease'
      }}
      onClick={handleCardClick}
    >
      {/* Node Header */}
      <div className="node-header">
        <div className="node-avatar-wrap">
          <img 
            src={node.avatar} 
            alt={node.firstName} 
            className="node-avatar" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div 
            className={`node-status-dot ${node.isAlive ? 'status-alive' : 'status-deceased'}`} 
            title={node.isAlive ? 'Hayot' : 'Vafot etgan'}
          />
        </div>

        <div className="node-identity">
          <div className="node-name" title={`${node.firstName} ${node.lastName}`}>
            {node.firstName} {node.lastName}
          </div>
          {node.maidenName && (
            <div className="node-maiden">({node.maidenName})</div>
          )}
          <span className="node-generation">
            {node.generation}-avlod
          </span>
        </div>
      </div>

      {/* Node Details */}
      <div className="node-details">
        <div className="node-detail-item" title="Yillari">
          <Calendar size={13} />
          <span>{getYearsText()}</span>
        </div>

        {node.profession && (
          <div className="node-detail-item" title={node.profession}>
            <Briefcase size={13} />
            <span>{node.profession}</span>
          </div>
        )}

        {node.birthPlace && (
          <div className="node-detail-item" title={node.birthPlace}>
            <MapPin size={13} />
            <span>{node.birthPlace}</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons on Hover */}
      <div className="node-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="action-chip"
          onClick={() => openDetail(node.id)}
          title="Batafsil ma'lumotlar"
        >
          <Eye size={12} />
          <span>Profil</span>
        </button>

        <button
          type="button"
          className="action-chip"
          onClick={() => openEditSidebar(node.id)}
          title="Tezkor tahrirlash"
        >
          <Edit3 size={12} />
          <span>Tahrir</span>
        </button>

        <button
          type="button"
          className="action-chip"
          onClick={() => openAddModal({ relativeId: node.id, relationType: 'child' })}
          title="Farzand qo'shish"
        >
          <UserPlus size={12} />
          <span>+ Bola</span>
        </button>
      </div>
    </div>
  );
};
