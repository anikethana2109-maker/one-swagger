import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SchemaViewerProps {
  schema: any;
  title?: string;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, title }) => {
  const [collapsedProperties, setCollapsedProperties] = useState<Record<string, boolean>>({});

  if (!schema) return null;

  const toggleProp = (propName: string) => {
    setCollapsedProperties(prev => ({ ...prev, [propName]: !prev[propName] }));
  };

  const renderTypeBadges = (prop: any) => {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
        {prop.type && (
          <span style={{ color: '#6366f1', fontFamily: 'Source Code Pro, monospace', fontSize: 11, fontWeight: 600 }}>
            {prop.type}
          </span>
        )}
        {prop.format === 'password' && (
          <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>
            password
          </span>
        )}
        {prop.pattern && (
          <span style={{ background: '#eab308', color: '#ffffff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>
            matches {prop.pattern}
          </span>
        )}
        {prop.default !== undefined && (
          <span style={{ color: '#64748b', fontSize: 11, fontStyle: 'italic' }}>
            Default="{String(prop.default)}"
          </span>
        )}
      </span>
    );
  };

  const renderProperties = (properties: Record<string, any>, requiredList: string[] = [], depth = 0) => {
    return Object.entries(properties).map(([key, prop]: [string, any]) => {
      const isRequired = requiredList.includes(key);
      const isSubObject = prop.type === 'object' || (prop.properties && Object.keys(prop.properties).length > 0);
      const isAnyOf = Array.isArray(prop.anyOf);
      const isCollapsed = !!collapsedProperties[key];

      return (
        <div key={key} style={{ margin: '6px 0', marginLeft: depth * 14, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(isSubObject || isAnyOf) && (
              <button
                onClick={() => toggleProp(key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b' }}
              >
                {isCollapsed ? <ChevronRight style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
              </button>
            )}

            <span style={{ fontFamily: 'Source Code Pro, monospace', fontWeight: 700, color: 'var(--text-heading)' }}>
              {key}{isRequired ? <span style={{ color: '#ef4444' }}>*</span> : ''}
            </span>

            {renderTypeBadges(prop)}

            {isSubObject && (
              <span style={{ fontSize: 10, color: '#94a3b8', cursor: 'pointer' }} onClick={() => toggleProp(key)}>
                {isCollapsed ? 'Expand all' : 'Collapse all'} object
              </span>
            )}
          </div>

          {/* Description */}
          {prop.description && (
            <p style={{ margin: '2px 0 2px 18px', fontSize: 11, color: 'var(--text-secondary)' }}>
              {prop.description}
            </p>
          )}

          {/* Sub Object properties */}
          {!isCollapsed && isSubObject && prop.properties && (
            <div style={{ borderLeft: '1.5px solid #e2e8f0', marginLeft: 8, paddingLeft: 10 }}>
              {renderProperties(prop.properties, prop.required || [], depth + 1)}
            </div>
          )}

          {/* AnyOf types */}
          {!isCollapsed && isAnyOf && (
            <div style={{ borderLeft: '1.5px solid #e2e8f0', marginLeft: 8, paddingLeft: 10, margin: '4px 0' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Any of:</div>
              {prop.anyOf.map((subSchema: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0', fontSize: 11 }}>
                  <span style={{ color: '#94a3b8', fontFamily: 'Source Code Pro, monospace' }}>#{i}</span>
                  <span style={{ color: '#6366f1', fontFamily: 'Source Code Pro, monospace' }}>{subSchema.type || 'object'}</span>
                  {subSchema.pattern && (
                    <span style={{ background: '#eab308', color: '#ffffff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>
                      matches {subSchema.pattern}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  const properties = schema.properties || {};
  const required = schema.required || [];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {Object.keys(properties).length > 0 ? (
        renderProperties(properties, required)
      ) : (
        <pre style={{
          background: 'transparent', margin: 0, padding: 0,
          fontFamily: 'Source Code Pro, monospace', fontSize: 11.5,
          color: '#6366f1',
        }}>
          {JSON.stringify(schema, null, 2)}
        </pre>
      )}
    </div>
  );
};
