import React, { useState } from 'react';
import { SchemaViewer } from './SchemaViewer';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface SchemasSectionProps {
  schemas?: Record<string, any>;
}

export const SchemasSection: React.FC<SchemasSectionProps> = ({ schemas }) => {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [openSchemaNames, setOpenSchemaNames] = useState<Record<string, boolean>>({
    // Open first schema by default like screenshot
  });

  if (!schemas || Object.keys(schemas).length === 0) return null;

  const schemaNames = Object.keys(schemas);

  // Open first schema by default
  React.useEffect(() => {
    if (schemaNames.length > 0 && Object.keys(openSchemaNames).length === 0) {
      setOpenSchemaNames({ [schemaNames[0]]: true });
    }
  }, [schemaNames.length]);

  const toggleSchema = (name: string) => {
    setOpenSchemaNames(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={{
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: 4,
      background: 'var(--bg-secondary, #ffffff)',
      marginTop: 24,
      overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    }}>
      {/* Schemas Section Header */}
      <div
        onClick={() => setIsSectionOpen(!isSectionOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', cursor: 'pointer', userSelect: 'none',
          borderBottom: isSectionOpen ? '1px solid var(--border-color, #e2e8f0)' : 'none',
          background: 'var(--bg-secondary, #ffffff)',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-heading, #3b4151)', letterSpacing: '-0.01em' }}>
          Schemas
        </span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #6b7280)' }}>
          {isSectionOpen ? <ChevronUp style={{ width: 18, height: 18 }} /> : <ChevronDown style={{ width: 18, height: 18 }} />}
        </button>
      </div>

      {/* Schemas List */}
      {isSectionOpen && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {schemaNames.map((name) => {
            const isOpen = !!openSchemaNames[name];
            const schemaObj = schemas[name];

            return (
              <div
                key={name}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  background: '#f8fafc',
                  overflow: 'hidden',
                }}
              >
                {/* Schema Header Row */}
                <div
                  onClick={() => toggleSchema(name)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'Source Code Pro, monospace', fontSize: 13,
                      fontWeight: 700, color: 'var(--text-heading, #3b4151)',
                    }}>
                      {name}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>
                      {isOpen ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      {isOpen ? 'Collapse all' : 'Expand all'}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#4f46e5',
                      fontFamily: 'Source Code Pro, monospace',
                    }}>
                      {schemaObj.type || 'object'}
                    </span>
                  </div>
                </div>

                {/* Expanded Schema Viewer Body */}
                {isOpen && (
                  <div style={{
                    padding: '12px 18px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#ffffff',
                  }}>
                    <SchemaViewer schema={schemaObj} title={name} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
