import React from 'react';
import { useFamily } from '../../context/FamilyContext';
import { 
  Heart, 
  UserPlus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Calendar,
  Sparkles
} from 'lucide-react';

export const MemberNode = ({ node }) => {
  const {
    selectedMemberId,
    highlightedMemberId,
    openDetail,
    openEditModal,
    openAddModal,
    deleteMember,
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
    openDetail(node.id);
  };

  const handleAction = (e, actionCallback) => {
    e.stopPropagation();
    actionCallback();
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
    </div>
  );
};
