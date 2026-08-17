import React, { useState, KeyboardEvent } from 'react';
import { useApp } from '../../context/AppContext';

const PRESETS = [
  {
    label: 'FastAPI :8000',
    url: 'http://127.0.0.1:8000/openapi.json',
    logo: (
      <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
        <circle cx="12" cy="12" r="12" fill="#009688"/>
        <path d="M8 13l4-8 4 8h-3v3h-2v-3H8z" fill="#fff"/>
      </svg>
    ),
  },
  {
    label: 'Express :3000',
    url: 'http://localhost:3000/api-docs/swagger.json',
    logo: (
      <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
        <rect width="24" height="24" rx="4" fill="#303030"/>
        <text x="4" y="17" fontSize="11" fontWeight="700" fill="#fff" fontFamily="monospace">Ex</text>
      </svg>
    ),
  },
  {
    label: 'Spring :8080',
    url: 'http://localhost:8080/v3/api-docs',
    logo: (
      <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
        <circle cx="12" cy="12" r="12" fill="#6DB33F"/>
        <path d="M7 16c1-4 5-7 10-6-2 3-6 5-10 6z" fill="#fff"/>
        <path d="M8 8c0 3 2 5 4 6-2-1-4-3-4-6z" fill="#fff" opacity=".6"/>
      </svg>
    ),
  },
  {
    label: 'Flask :5000',
    url: 'http://localhost:5000/openapi.json',
    logo: (
      <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }} fill="none">
        <rect width="24" height="24" rx="4" fill="#000"/>
        <path d="M10 4h4v2l2 8a4 4 0 11-8 0l2-8V4z" fill="#fff" opacity=".85"/>
      </svg>
    ),
  },
];

const OneSwaggerLogo: React.FC = () => (
  <div style={{
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #49cc90 0%, #009688 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(73, 204, 144, 0.35)', flexShrink: 0,
  }}>
    <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }} fill="none">
      <path d="M13 2L4.09 12.99H11L10 22L19.91 11.01H13L13 2Z" fill="white" strokeLinejoin="round"/>
    </svg>
  </div>
);

export const Header: React.FC = () => {
  const {
    serverUrl,
    loadSpecFromUrl,
    isLoadingSpec,
    specError,
    authToken,
    setAuthToken,
    setIsHistoryOpen,
    setIsCodeGenOpen,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tokenDraft, setTokenDraft] = useState(authToken);

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

  const saveAuth = () => {
    setAuthToken(tokenDraft.trim());
    setShowAuthModal(false);
  };

  return (
    <header style={{
      background: 'var(--bg-secondary, #ffffff)',
      borderBottom: '1px solid var(--border-color, #e2e8f0)',
      padding: '12px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OneSwaggerLogo />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading, #3b4151)', letterSpacing: '-0.02em' }}>
                One Swagger
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: '#ebf5ee', color: '#49cc90',
                border: '1px solid #49cc90',
                padding: '1px 6px', borderRadius: 10,
              }}>
                v1.0
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary, #6b7280)' }}>
              Universal 1-Tap API Explorer & Interactive Playground
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="Request History"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 6, padding: '6px 12px', fontSize: 12,
              fontWeight: 600, color: '#475569', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg style={{ width: 14, height: 14, color: '#49cc90' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <span>History</span>
          </button>

          <button
            onClick={() => setIsCodeGenOpen(true)}
            title="Generate Client Code"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 6, padding: '6px 12px', fontSize: 12,
              fontWeight: 600, color: '#475569', cursor: 'pointer',
            }}
          >
            <svg style={{ width: 14, height: 14, color: '#61affe' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={() => {
              setTokenDraft(authToken);
              setShowAuthModal(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: authToken ? '#ebf5ee' : '#ffffff',
              border: `1.5px solid ${authToken ? '#49cc90' : '#49cc90'}`,
              color: '#49cc90',
              borderRadius: 6, padding: '6px 14px', fontSize: 12,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            <span>Authorize</span>
            <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {authToken ? (
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              ) : (
                <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* URL Input + Presets */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: '#f8fafc', border: '1.5px solid #cbd5e1',
          borderRadius: 8, padding: '0 12px', gap: 8,
        }}>
          <svg style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2}/>
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth={2}/>
          </svg>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="http://localhost:8000/openapi.json"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              padding: '10px 0', fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#1e293b', outline: 'none',
            }}
          />
          <button
            onClick={handleExplore}
            disabled={isLoadingSpec}
            style={{
              background: '#49cc90', color: '#fff',
              border: 'none', borderRadius: 6,
              padding: '6px 14px', fontSize: 12,
              fontWeight: 700, cursor: 'pointer',
              opacity: isLoadingSpec ? 0.7 : 1,
            }}
          >
            {isLoadingSpec ? 'Loading...' : 'Explore'}
          </button>
        </div>

        {/* Preset Pills */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.url)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#f1f5f9', border: '1px solid #e2e8f0',
                borderRadius: 20, padding: '5px 10px', fontSize: 11,
                fontWeight: 600, color: '#475569', cursor: 'pointer',
              }}
            >
              {p.logo}
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {specError && (
        <div style={{
          background: '#fce7e7', border: '1px solid #f93e3e',
          borderRadius: 6, padding: '6px 12px', fontSize: 12,
          color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg style={{ width: 14, height: 14, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2}/>
            <path d="M12 8v4m0 4h.01" strokeWidth={2} strokeLinecap="round"/>
          </svg>
          <span>{specError}</span>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 10,
            padding: '24px', width: 440, maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#3b4151' }}>
                Available Authorizations
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8' }}
              >
                ?
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
              Bearer HTTP authentication. Automatically injected as <code>Authorization: Bearer &lt;token&gt;</code> into all requests.
            </p>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Value:
              </label>
              <input
                type="text"
                value={tokenDraft}
                onChange={(e) => setTokenDraft(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1.5px solid #cbd5e1', borderRadius: 6,
                  padding: '8px 10px', fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {authToken && (
                <button
                  onClick={() => { setAuthToken(''); setTokenDraft(''); setShowAuthModal(false); }}
                  style={{
                    background: '#fee2e2', border: 'none', borderRadius: 6,
                    padding: '8px 14px', fontSize: 12, fontWeight: 600,
                    color: '#b91c1c', cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              )}
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 6,
                  padding: '8px 14px', fontSize: 12, fontWeight: 600,
                  color: '#475569', cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={saveAuth}
                style={{
                  background: '#49cc90', color: '#fff',
                  border: 'none', borderRadius: 6,
                  padding: '8px 18px', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
