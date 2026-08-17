import React from 'react';
import { OpenApiParameter } from '../../../types/openapi';

interface ParameterTableProps {
  parameters: OpenApiParameter[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export const ParameterTable: React.FC<ParameterTableProps> = ({ parameters, values, onChange }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 4 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#334155', fontSize: 11 }}>Name</th>
          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#334155', fontSize: 11 }}>Description</th>
          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#334155', fontSize: 11, width: 200 }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {parameters.map((param) => (
          <tr key={param.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Source Code Pro, monospace', fontWeight: 700, color: '#1e293b' }}>
                  {param.name}
                  {param.required && <span style={{ color: '#ef4444' }}>*</span>}
                </span>
                <span style={{ fontSize: 10, color: '#6366f1', fontFamily: 'Source Code Pro, monospace' }}>
                  {param.schema?.type || 'string'}
                </span>
                <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
                  ({param.in})
                </span>
              </div>
            </td>
            <td style={{ padding: '8px 12px', verticalAlign: 'top', color: '#475569', fontSize: 12 }}>
              {param.description || '—'}
              {param.schema?.enum && (
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {param.schema.enum.map((v: any, i: number) => (
                    <span key={i} style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 3,
                      background: '#f1f5f9', border: '1px solid #e2e8f0',
                      fontFamily: 'Source Code Pro, monospace', color: '#475569',
                    }}>
                      {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </td>
            <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
              {param.schema?.enum ? (
                <select
                  value={values[param.name] || ''}
                  onChange={(e) => onChange(param.name, e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1px solid #cbd5e1', borderRadius: 4,
                    padding: '5px 8px', fontSize: 12, outline: 'none', background: '#fff',
                  }}
                >
                  <option value="">— select —</option>
                  {param.schema.enum.map((v: any) => (
                    <option key={String(v)} value={String(v)}>{String(v)}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[param.name] || ''}
                  onChange={(e) => onChange(param.name, e.target.value)}
                  placeholder={param.schema?.default !== undefined ? String(param.schema.default) : param.example ? String(param.example) : param.schema?.type || ''}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1px solid #cbd5e1', borderRadius: 4,
                    padding: '5px 8px', fontSize: 12,
                    fontFamily: 'Source Code Pro, monospace', outline: 'none',
                  }}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
