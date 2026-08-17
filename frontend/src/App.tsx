import React, { useState, KeyboardEvent } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { TagGroup } from './features/spec-explorer/components/TagGroup';
import { SchemasSection } from './features/spec-explorer/components/SchemasSection';
import { RequestEditor } from './features/playground/components/RequestEditor';
import { ResponseInspector } from './features/response-viewer/components/ResponseInspector';
import { HistoryDrawer } from './features/history/components/HistoryDrawer';
import { SettingsModal } from './features/settings/components/SettingsModal';
import { CodeGenModal } from './features/code-gen/components/CodeGenModal';

const PRESETS = [
  { label: 'FastAPI :8000', url: 'http://127.0.0.1:8000/openapi.json' },
  { label: 'Express :3000', url: 'http://localhost:3000/api-docs/swagger.json' },
  { label: 'Spring :8080', url: 'http://localhost:8080/v3/api-docs' },
  { label: 'Flask :5000', url: 'http://localhost:5000/openapi.json' },
];

export const App: React.FC = () => {
  const {
    tagGroups,
    isLoadingSpec,
    spec,
    serverUrl,
    loadSpecFromUrl,
    specError,
    setIsSettingsOpen
  } = useApp();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);

  const handleExplore = () => {
    if (inputUrl.trim()) {
      loadSpecFromUrl(inputUrl.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleExplore();
  };

  const handlePreset = (url: string) => {
    setInputUrl(url);
    loadSpecFromUrl(url);
  };

  const filteredTagGroups = tagGroups
    .map(group => ({
      ...group,
      endpoints: group.endpoints.filter(ep =>
        ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ep.method.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(group => group.endpoints.length > 0);

  const oasVersion = spec?.openapi || spec?.swagger || 'OAS 3.1';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #fafafa)', color: 'var(--text-primary, #3b4151)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar with Brand, History, Actions, and Routes */}
      <Sidebar />

      <main style={{ flex: 1, padding: '12px 20px', width: '100%', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Integrated 1-Line URL Bar with Presets */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12,
          background: 'var(--bg-secondary, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 6, padding: '6px 10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: '#f8fafc', border: '1px solid #cbd5e1',
            borderRadius: 5, padding: '0 10px', gap: 8,
          }}>
            <svg style={{ width: 15, height: 15, color: '#94a3b8', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2}/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth={2}/>
            </svg>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="http://127.0.0.1:8000/openapi.json"
              style={{
                flex: 1, border: 'none', background: 'transparent',
                padding: '7px 0', fontSize: 12.5,
                fontFamily: 'Source Code Pro, monospace',
                color: '#1e293b', outline: 'none',
              }}
            />
            <button
              onClick={handleExplore}
              disabled={isLoadingSpec}
              style={{
                background: '#49cc90', color: '#fff',
                border: 'none', borderRadius: 4,
                padding: '4px 12px', fontSize: 11.5,
                fontWeight: 700, cursor: 'pointer',
                opacity: isLoadingSpec ? 0.7 : 1,
              }}
            >
              {isLoadingSpec ? 'Loading...' : 'Explore'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.url)}
                style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  borderRadius: 14, padding: '4px 9px', fontSize: 10.5,
                  fontWeight: 600, color: '#475569', cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {specError && (
          <div style={{
            background: '#fce7e7', border: '1px solid #f93e3e',
            borderRadius: 6, padding: '6px 12px', fontSize: 12,
            color: '#b91c1c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2}/>
              <path d="M12 8v4m0 4h.01" strokeWidth={2} strokeLinecap="round"/>
            </svg>
            <span>{specError}</span>
          </div>
        )}

        {/* Spec Info Header (Swagger UI Style) */}
        <div style={{
          background: 'var(--bg-secondary, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 6, padding: '12px 18px', marginBottom: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-heading, #3b4151)' }}>
                {spec?.info?.title || 'One Swagger'}
              </h1>
              <span style={{
                fontSize: 10, fontWeight: 700, background: '#7d8492', color: '#fff',
                padding: '2px 7px', borderRadius: 10,
              }}>
                {spec?.info?.version || '1.0.0'}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, background: '#89bf04', color: '#fff',
                padding: '2px 7px', borderRadius: 10,
              }}>
                {oasVersion}
              </span>
            </div>
            <a
              href={spec ? '/openapi.json' : '#'}
              style={{ fontSize: 11, color: '#61affe', fontFamily: 'Source Code Pro, monospace', textDecoration: 'none' }}
            >
              /openapi.json
            </a>
            {spec?.info?.description && (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-secondary, #6b7280)', lineHeight: 1.4 }}>
                {spec.info.description}
              </p>
            )}
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: '1.5px solid #49cc90',
              color: '#49cc90', borderRadius: 4, padding: '5px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <span>Authorize</span>
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* Filter Bar & Freeform Button */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter routes (e.g. /auth, POST)..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg-secondary, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: 4, padding: '8px 12px', fontSize: 12,
                outline: 'none', color: 'var(--text-primary, #3b4151)',
              }}
            />
          </div>

          <button
            onClick={() => setIsCustomRequestOpen(!isCustomRequestOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isCustomRequestOpen ? '#49cc90' : '#ffffff',
              border: '1px solid #49cc90',
              color: isCustomRequestOpen ? '#ffffff' : '#49cc90',
              borderRadius: 4, padding: '0 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            <span>{isCustomRequestOpen ? 'Close Freeform Tester' : '+ Freeform Ad-Hoc Request'}</span>
          </button>
        </div>

        {/* Freeform Console */}
        {isCustomRequestOpen && (
          <div style={{
            background: 'var(--bg-secondary, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 6, padding: '16px', marginBottom: 12,
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 700, color: '#3b4151' }}>
              Freeform Ad-Hoc Request Console
            </h3>
            <RequestEditor />
            <div style={{ marginTop: 12 }}>
              <ResponseInspector />
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoadingSpec && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Fetching and parsing OpenAPI specification...</p>
          </div>
        )}

        {/* Tag Groups (Original Swagger UI Method Accordions) */}
        {!isLoadingSpec && filteredTagGroups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTagGroups.map(group => (
              <TagGroup key={group.tag} tagGroup={group} />
            ))}
          </div>
        )}

        {/* Schemas */}
        {!isLoadingSpec && spec?.components?.schemas && (
          <div style={{ marginTop: 16 }}>
            <SchemasSection schemas={spec.components.schemas} />
          </div>
        )}

        {/* Empty State */}
        {!isLoadingSpec && filteredTagGroups.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'var(--bg-secondary, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 6,
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 15, color: '#3b4151' }}>No Endpoints Found</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
              Enter your backend server URL above or select a preset to explore REST endpoints.
            </p>
          </div>
        )}
      </main>

      <HistoryDrawer />
      <SettingsModal />
      <CodeGenModal />
    </div>
  );
};
