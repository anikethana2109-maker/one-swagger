import React, { useState } from 'react';
import { ParsedEndpoint, HttpMethod } from '../../../types/openapi';
import { useApp } from '../../../context/AppContext';
import { ParameterTable } from './ParameterTable';
import { SchemaViewer } from './SchemaViewer';
import { ChevronDown, ChevronUp, Copy, Check, Download } from 'lucide-react';

interface EndpointCardProps {
  endpoint: ParsedEndpoint;
}


function generateSampleBody(schema: any): string {
  if (!schema) return '';
  
  if (schema.example) {
    return JSON.stringify(schema.example, null, 2);
  }

  if (schema.properties) {
    const sample: Record<string, any> = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      if (prop.example !== undefined) {
        sample[key] = prop.example;
      } else if (prop.default !== undefined) {
        sample[key] = prop.default;
      } else if (prop.enum && prop.enum.length > 0) {
        sample[key] = prop.enum[0];
      } else if (prop.type === 'string') {
        if (prop.format === 'email') sample[key] = 'user@example.com';
        else if (prop.format === 'password') sample[key] = 'password123';
        else if (prop.format === 'uri' || prop.format === 'url') sample[key] = 'https://example.com';
        else if (prop.format === 'date') sample[key] = '2024-01-01';
        else if (prop.format === 'date-time') sample[key] = '2024-01-01T00:00:00Z';
        else sample[key] = 'string';
      } else if (prop.type === 'integer') {
        sample[key] = 0;
      } else if (prop.type === 'number') {
        sample[key] = 0.0;
      } else if (prop.type === 'boolean') {
        sample[key] = true;
      } else if (prop.type === 'array') {
        if (prop.items?.properties) {
          // Nested object array
          const nested: Record<string, any> = {};
          Object.entries(prop.items.properties).forEach(([nk, nv]: [string, any]) => {
            if (nv.example !== undefined) nested[nk] = nv.example;
            else if (nv.type === 'string') nested[nk] = 'string';
            else if (nv.type === 'integer' || nv.type === 'number') nested[nk] = 0;
            else nested[nk] = null;
          });
          sample[key] = [nested];
        } else {
          sample[key] = [];
        }
      } else if (prop.type === 'object' || prop.properties) {
        // Nested object
        try {
          sample[key] = JSON.parse(generateSampleBody(prop));
        } catch {
          sample[key] = {};
        }
      } else if (prop.anyOf) {
        // Pick first non-null type from anyOf
        const firstReal = prop.anyOf.find((s: any) => s.type !== 'null');
        if (firstReal?.type === 'string') sample[key] = 'string';
        else if (firstReal?.type === 'integer') sample[key] = 0;
        else sample[key] = null;
      } else {
        sample[key] = 'string';
      }
    });
    return JSON.stringify(sample, null, 2);
  }

  if (schema.type === 'array' && schema.items) {
    const inner = generateSampleBody(schema.items);
    try {
      return JSON.stringify([JSON.parse(inner)], null, 2);
    } catch {
      return '[]';
    }
  }

  return '';
}

export const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint }) => {
  const {
    selectedEndpoint,
    setSelectedEndpoint,
    setRequestConfig,
    serverUrl,
    executeCurrentRequest,
    isExecuting,
    responseResult,
    setResponseResult,
    setIsSettingsOpen,
    authToken
  } = useApp();

  const isSelected = selectedEndpoint?.id === endpoint.id;
  const methodLower = (endpoint.method || 'get').toLowerCase() as HttpMethod;

  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [activeBodyTab, setActiveBodyTab] = useState<'edit' | 'schema'>('edit');
  const [copied, setCopied] = useState(false);

  // Derive sample body from requestBody schema
  const requestBodySchema = endpoint.requestBody?.content?.['application/json']?.schema;
  const [rawBody, setRawBody] = useState<string>(() => {
    return generateSampleBody(requestBodySchema);
  });

  const handleToggle = () => {
    if (isSelected) {
      setSelectedEndpoint(null);
    } else {
      let baseUrl = 'http://127.0.0.1:8000';
      try {
        baseUrl = new URL(serverUrl).origin;
      } catch {}

      let bodyObj: any = undefined;
      try {
        if (rawBody.trim()) bodyObj = JSON.parse(rawBody);
      } catch {
        bodyObj = rawBody;
      }

      setSelectedEndpoint(endpoint);
      setResponseResult(null);
      setRequestConfig({
        url: `${baseUrl}${endpoint.path}`,
        method: endpoint.method.toUpperCase(),
        headers: {},
        params: paramValues,
        body: bodyObj
      });
    }
  };

  const handleParamChange = (name: string, val: string) => {
    const updated = { ...paramValues, [name]: val };
    setParamValues(updated);
    setRequestConfig(prev => ({ ...prev, params: updated }));
  };

  const handleBodyTextChange = (text: string) => {
    setRawBody(text);
    try {
      const parsed = JSON.parse(text);
      setRequestConfig(prev => ({ ...prev, body: parsed }));
    } catch {
      setRequestConfig(prev => ({ ...prev, body: text }));
    }
  };

  const handleReset = () => {
    setParamValues({});
    setResponseResult(null);
  };

  const handleCopyResponse = () => {
    if (!responseResult) return;
    const text = typeof responseResult.data === 'object' ? JSON.stringify(responseResult.data, null, 2) : String(responseResult.rawText);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResponse = () => {
    if (!responseResult) return;
    const text = typeof responseResult.data === 'object' ? JSON.stringify(responseResult.data, null, 2) : String(responseResult.rawText);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${endpoint.method}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show lock icon on ALL endpoints when spec has securitySchemes (matches Swagger UI behavior)
  const isAuthRequired = true;

  return (
    <div className={`swagger-endpoint method-${methodLower} ${isSelected ? 'is-open' : ''}`}>
      {/* Method Accordion Header */}
      <div onClick={handleToggle} className="swagger-endpoint-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <span className={`method-badge ${methodLower}`}>
            {endpoint.method}
          </span>
          <span className="endpoint-path">
            {endpoint.path}
          </span>
          <span className="endpoint-summary">
            {endpoint.summary}
          </span>
        </div>

        <div className="endpoint-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAuthRequired && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
              title={authToken ? "Authorized (Bearer Token active) — Click to manage authentication" : "Authorization required — Click to authenticate"}
              style={{
                background: authToken ? 'rgba(73, 204, 144, 0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 6px',
                borderRadius: 4,
                color: authToken ? '#49cc90' : '#64748b',
                transition: 'all 0.15s ease',
              }}
              className="endpoint-lock-btn"
            >
              <svg style={{ width: 17, height: 17 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {authToken ? (
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                ) : (
                  <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                )}
              </svg>
            </button>
          )}

          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            {isSelected ? (
              <ChevronUp className="endpoint-chevron" />
            ) : (
              <ChevronDown className="endpoint-chevron" />
            )}
          </span>
        </div>
      </div>

      {/* Expanded Tinted Body */}
      {isSelected && (
        <div className="swagger-endpoint-body">
          {/* Description */}
          {endpoint.description && (
            <p style={{
              fontSize: 13, color: 'var(--text-primary)', background: '#ffffff',
              padding: '10px 14px', borderRadius: 4, border: '1px solid var(--border-color)',
              marginBottom: 16, lineHeight: 1.5,
            }}>
              {endpoint.description}
            </p>
          )}

          {/* Parameters Section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', borderBottom: '2px solid #49cc90', paddingBottom: 6 }}>
                Parameters
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleReset}
                  style={{
                    background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4,
                    padding: '3px 12px', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {endpoint.parameters && endpoint.parameters.length > 0 ? (
              <ParameterTable parameters={endpoint.parameters} values={paramValues} onChange={handleParamChange} />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No parameters
              </span>
            )}
          </div>

          {/* Request Body Section */}
          {['post', 'put', 'patch'].includes(methodLower) && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                    Request body
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#e11d48' }}>
                    required
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select style={{
                    background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4,
                    padding: '4px 8px', fontSize: 12, fontWeight: 600, color: '#334155', outline: 'none',
                  }}>
                    <option>application/json</option>
                  </select>
                </div>
              </div>

              {/* Subtabs: Edit Value / Schema */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 12 }}>
                <button
                  onClick={() => setActiveBodyTab('edit')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: activeBodyTab === 'edit' ? 700 : 500,
                    color: activeBodyTab === 'edit' ? '#10b981' : '#64748b',
                    textDecoration: activeBodyTab === 'edit' ? 'underline' : 'none',
                  }}
                >
                  Edit Value
                </button>
                <button
                  onClick={() => setActiveBodyTab('schema')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: activeBodyTab === 'schema' ? 700 : 500,
                    color: activeBodyTab === 'schema' ? '#10b981' : '#64748b',
                    textDecoration: activeBodyTab === 'schema' ? 'underline' : 'none',
                  }}
                >
                  Schema
                </button>
              </div>

              {activeBodyTab === 'edit' ? (
                <textarea
                  rows={8}
                  value={rawBody}
                  onChange={(e) => handleBodyTextChange(e.target.value)}
                  placeholder='{ "key": "value" }'
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#ffffff', border: '1px solid #cbd5e1',
                    borderRadius: 4, padding: '12px 14px',
                    fontFamily: 'Source Code Pro, monospace', fontSize: 12.5,
                    color: '#1e293b', outline: 'none', lineHeight: 1.45,
                  }}
                />
              ) : (
                requestBodySchema && <SchemaViewer schema={requestBodySchema} />
              )}
            </div>
          )}

          {/* Execute Bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <button
              onClick={executeCurrentRequest}
              disabled={isExecuting}
              className="swagger-execute-btn"
              style={{ flex: 1, height: 38, opacity: isExecuting ? 0.7 : 1 }}
            >
              {isExecuting ? 'Executing...' : 'Execute'}
            </button>
            <button
              onClick={() => setResponseResult(null)}
              className="swagger-clear-btn"
              style={{ height: 38 }}
            >
              Clear
            </button>
          </div>

          {/* Live Response Container (Dark Swagger Box) */}
          {responseResult && (
            <div style={{ marginBottom: 18 }}>
              {/* Response Body Box */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                      Response body
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: responseResult.status < 400 ? '#10b981' : '#f43f5e',
                      background: responseResult.status < 400 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {responseResult.status} {responseResult.statusText}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Source Code Pro, monospace' }}>
                      ({responseResult.latencyMs} ms)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={handleCopyResponse}
                      title="Copy response JSON"
                      style={{
                        background: '#3f3f46', border: 'none', borderRadius: 4,
                        padding: '4px 8px', color: '#fff', fontSize: 11,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {copied ? <Check style={{ width: 12, height: 12, color: '#4ade80' }} /> : <Copy style={{ width: 12, height: 12 }} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadResponse}
                      title="Download JSON"
                      style={{
                        background: '#3f3f46', border: 'none', borderRadius: 4,
                        padding: '4px 8px', color: '#fff', fontSize: 11,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <Download style={{ width: 12, height: 12 }} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <pre className="swagger-code-box">
                  <code>
                    {typeof responseResult.data === 'object'
                      ? JSON.stringify(responseResult.data, null, 2)
                      : String(responseResult.rawText || responseResult.statusText)}
                  </code>
                </pre>
              </div>

              {/* Response Headers Box */}
              <div>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 6 }}>
                  Response headers
                </span>
                <pre className="swagger-code-box" style={{ maxHeight: 150 }}>
                  <code>
                    {Object.entries(responseResult.headers || {})
                      .map(([k, v]) => `${k.toLowerCase()}: ${v}`)
                      .join('\n') || 'content-type: application/json'}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Expected Responses Specification Table */}
          {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
            <div>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 6 }}>
                Responses
              </span>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#64748b' }}>
                    <th style={{ padding: '6px 8px', width: 90 }}>Code</th>
                    <th style={{ padding: '6px 8px' }}>Description</th>
                    <th style={{ padding: '6px 8px', width: 70, textAlign: 'right' }}>Links</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(endpoint.responses).map(([code, resp]: [string, any]) => (
                    <tr key={code} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '8px', verticalAlign: 'top', fontWeight: 700, fontFamily: 'Source Code Pro, monospace' }}>
                        {code}
                      </td>
                      <td style={{ padding: '8px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>
                          {resp.description || 'Response'}
                        </div>
                        {resp.content?.['application/json']?.schema && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>
                              Media type: application/json
                            </span>
                            <pre className="swagger-code-box" style={{ maxHeight: 110, padding: '8px 10px', fontSize: 11 }}>
                              <code>
                                {JSON.stringify(resp.content['application/json'].schema.example || resp.content['application/json'].schema, null, 2)}
                              </code>
                            </pre>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px', verticalAlign: 'top', textAlign: 'right', fontStyle: 'italic', color: '#94a3b8' }}>
                        No links
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
