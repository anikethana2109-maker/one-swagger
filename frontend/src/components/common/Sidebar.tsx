import React from 'react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    tagGroups,
    selectedEndpoint,
    setSelectedEndpoint,
    setIsHistoryOpen,
    setIsCodeGenOpen,
    setIsSettingsOpen,
    authToken,
  } = useApp();

  return (
    <aside
      style={{
        width: 60,
        flexShrink: 0,
        background: 'var(--bg-secondary, #ffffff)',
        borderRight: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 30,
        overflow: 'hidden',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '1px 0 3px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={e => (e.currentTarget.style.width = '260px')}
      onMouseLeave={e => (e.currentTarget.style.width = '60px')}
      className="sidebar-host"
    >
      {/* Brand Icon inside Sidebar */}
      <div style={{
        padding: '12px 10px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: 'linear-gradient(135deg, #49cc90 0%, #009688 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(73, 204, 144, 0.35)', flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} fill="none">
            <path d="M13 2L4.09 12.99H11L10 22L19.91 11.01H13L13 2Z" fill="white" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="sidebar-label" style={{ whiteSpace: 'nowrap', opacity: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading, #3b4151)' }}>One Swagger</span>
            <span style={{ fontSize: 9, fontWeight: 700, background: '#ebf5ee', color: '#49cc90', padding: '1px 5px', borderRadius: 6, border: '1px solid #49cc90' }}>v1.0</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-secondary, #6b7280)' }}>API Explorer</span>
        </div>
      </div>

      {/* Quick Action Navigation: History & CodeGen */}
      <div style={{ padding: '8px 6px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        {/* History Button */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          title="Request History"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', border: 'none', background: 'transparent',
            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
            textAlign: 'left',
          }}
          className="sidebar-action-btn"
        >
          <svg style={{ width: 20, height: 20, flexShrink: 0, color: '#49cc90' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap', opacity: 0 }} className="sidebar-label">
            History
          </span>
        </button>

        {/* Code Snippets Button */}
        <button
          onClick={() => setIsCodeGenOpen(true)}
          title="Generate Client Code"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', border: 'none', background: 'transparent',
            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
            textAlign: 'left',
          }}
          className="sidebar-action-btn"
        >
          <svg style={{ width: 20, height: 20, flexShrink: 0, color: '#61affe' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', opacity: 0 }} className="sidebar-label">
            Client Code
          </span>
        </button>

        {/* Authorize Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Set Authorization Token"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', border: 'none',
            background: authToken ? 'rgba(73, 204, 144, 0.12)' : 'transparent',
            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
            textAlign: 'left',
          }}
          className="sidebar-action-btn"
        >
          <svg style={{ width: 20, height: 20, flexShrink: 0, color: authToken ? '#49cc90' : '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: authToken ? '#49cc90' : '#374151', whiteSpace: 'nowrap', opacity: 0 }} className="sidebar-label">
            {authToken ? 'Authorized ?' : 'Authorize'}
          </span>
        </button>
      </div>

      {/* Routes Documentation Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 6px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 10px', marginBottom: 2 }}>
          <svg style={{ width: 18, height: 18, flexShrink: 0, color: '#49cc90' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', opacity: 0 }} className="sidebar-label">
            Routes ({tagGroups.reduce((a, g) => a + g.endpoints.length, 0)})
          </span>
        </div>

        {tagGroups.map(group => (
          <div key={group.tag} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
              <svg style={{ width: 14, height: 14, flexShrink: 0, color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3b4151', whiteSpace: 'nowrap', opacity: 0 }} className="sidebar-label">
                {group.tag}
              </span>
            </div>

            {group.endpoints.map(ep => {
              const isSel = selectedEndpoint?.id === ep.id;
              const method = ep.method.toLowerCase();
              const badgeBg = method === 'get' ? '#61affe' : method === 'post' ? '#49cc90' : method === 'put' ? '#fca130' : method === 'delete' ? '#f93e3e' : '#50e3c2';
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', border: 'none',
                    background: isSel ? 'rgba(73, 204, 144, 0.12)' : 'transparent',
                    padding: '5px 6px 5px 18px', borderRadius: 4, cursor: 'pointer',
                    borderLeft: isSel ? '3px solid #49cc90' : '3px solid transparent',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontSize: 8.5, fontWeight: 700, fontFamily: 'Source Code Pro, monospace',
                    textTransform: 'uppercase', padding: '2px 4px', borderRadius: 3,
                    background: badgeBg, color: '#ffffff', flexShrink: 0,
                  }}>
                    {ep.method}
                  </span>
                  <span style={{
                    fontSize: 10.5, fontFamily: 'Source Code Pro, monospace',
                    color: isSel ? '#1e293b' : '#64748b',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    opacity: 0, maxWidth: 150, fontWeight: isSel ? 600 : 400,
                  }} className="sidebar-label">
                    {ep.path}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        .sidebar-host:hover .sidebar-label { opacity: 1 !important; transition: opacity 0.2s ease; }
        .sidebar-host .sidebar-label { transition: opacity 0.15s ease; }
        .sidebar-action-btn:hover { background: rgba(0,0,0,0.05) !important; }
      `}</style>
    </aside>
  );
};
