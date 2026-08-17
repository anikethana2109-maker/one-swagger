import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getLocalHistory, clearLocalHistory, exportHistoryAsJson } from '../services/localHistoryStorage';
import { HistoryItem } from '../../../types/http';

const METHOD_COLORS: Record<string, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e',
  PATCH: '#50e3c2',
  OPTIONS: '#9012fe',
  HEAD: '#9012fe',
};

export const HistoryDrawer: React.FC = () => {
  const { isHistoryOpen, setIsHistoryOpen, loadHistoryIntoEditor } = useApp();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isHistoryOpen) {
      setHistoryItems(getLocalHistory());
    }
  }, [isHistoryOpen]);

  if (!isHistoryOpen) return null;

  const handleClear = () => {
    if (confirm('Clear all request history?')) {
      clearLocalHistory();
      setHistoryItems([]);
    }
  };

  const filtered = historyItems.filter(
    (h) =>
      h.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.status).includes(searchTerm)
  );

  // Group by date
  const grouped: Record<string, HistoryItem[]> = {};
  filtered.forEach((item) => {
    const dateKey = new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  return (
    <div
      onClick={() => setIsHistoryOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, height: '100%',
          background: '#ffffff', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0',
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 18px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 18, height: 18, color: '#49cc90' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Request History
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#94a3b8', fontFamily: 'Source Code Pro, monospace' }}>
              {historyItems.length} requests recorded locally
            </p>
          </div>

          <button
            onClick={() => setIsHistoryOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: 20, fontWeight: 700, padding: '4px 8px',
            }}
          >
            x
          </button>
        </div>

        {/* Search & Actions */}
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 8, top: 7, width: 14, height: 14, color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth={2} />
              <path d="M21 21l-4.35-4.35" strokeWidth={2} />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by URL, method, or status..."
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 28, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
                border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 11,
                fontFamily: 'Source Code Pro, monospace', outline: 'none',
              }}
            />
          </div>

          <button
            onClick={exportHistoryAsJson}
            title="Export as JSON"
            style={{
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 4,
              padding: '5px 8px', cursor: 'pointer', color: '#475569',
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>

          <button
            onClick={handleClear}
            title="Clear all history"
            style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4,
              padding: '5px 8px', cursor: 'pointer', color: '#dc2626',
              display: 'flex', alignItems: 'center',
            }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* History Items Grouped by Date */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div style={{
                padding: '6px 18px', fontSize: 10, fontWeight: 700,
                color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
                background: '#fafafa',
              }}>
                {date}
              </div>

              {items.map((item) => {
                const isSuccess = item.status >= 200 && item.status < 300;
                const methodColor = METHOD_COLORS[item.method.toUpperCase()] || '#64748b';
                const pathOnly = (() => {
                  try { return new URL(item.url).pathname; } catch { return item.url; }
                })();

                return (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryIntoEditor(item.url, item.method, item.requestBody)}
                    style={{
                      padding: '9px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Method Badge */}
                    <span style={{
                      fontSize: 9, fontWeight: 700, fontFamily: 'Source Code Pro, monospace',
                      textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3,
                      background: methodColor, color: '#ffffff', flexShrink: 0,
                      minWidth: 44, textAlign: 'center',
                    }}>
                      {item.method}
                    </span>

                    {/* Path & URL */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: '#1e293b',
                        fontFamily: 'Source Code Pro, monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {pathOnly}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Source Code Pro, monospace' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Status & Latency */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700,
                        fontFamily: 'Source Code Pro, monospace',
                        color: isSuccess ? '#10b981' : '#ef4444',
                      }}>
                        {item.status}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        {item.latencyMs}ms
                      </div>
                    </div>

                    {/* Replay Arrow */}
                    <svg style={{ width: 14, height: 14, color: '#cbd5e1', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </div>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <svg style={{ width: 40, height: 40, margin: '0 auto 12px', color: '#cbd5e1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
              </svg>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: 0 }}>No requests yet</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0 0' }}>Execute API calls to start logging history</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
