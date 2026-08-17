import React, { useState } from 'react';
import { TagGroupData } from '../../../types/openapi';
import { EndpointCard } from './EndpointCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagGroupProps {
  tagGroup: TagGroupData;
}

export const TagGroup: React.FC<TagGroupProps> = ({ tagGroup }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="swagger-tag-group">
      <div onClick={() => setIsOpen(!isOpen)} className="swagger-tag-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h3 className="swagger-tag-name">
            {tagGroup.tag}
          </h3>
          {tagGroup.description && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {tagGroup.description}
            </span>
          )}
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          {isOpen ? <ChevronUp style={{ width: 22, height: 22 }} /> : <ChevronDown style={{ width: 22, height: 22 }} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: 8 }}>
          {tagGroup.endpoints.map((ep) => (
            <EndpointCard key={ep.id} endpoint={ep} />
          ))}
        </div>
      )}
    </div>
  );
};
