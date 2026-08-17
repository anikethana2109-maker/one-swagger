import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Play, Plus, Trash2, Send } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const RequestEditor: React.FC = () => {
  const { requestConfig, setRequestConfig, executeCurrentRequest, isExecuting } = useApp();
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  const [rawBodyText, setRawBodyText] = useState(() => {
    return requestConfig.body ? JSON.stringify(requestConfig.body, null, 2) : '';
  });

  const handleBodyChange = (text: string) => {
    setRawBodyText(text);
    try {
      const parsed = JSON.parse(text);
      setRequestConfig((prev) => ({ ...prev, body: parsed }));
    } catch {
      setRequestConfig((prev) => ({ ...prev, body: text }));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Request Line */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <select
          value={requestConfig.method.toUpperCase()}
          onChange={(e) => setRequestConfig((prev) => ({ ...prev, method: e.target.value }))}
          className="w-full sm:w-28 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="text"
          value={requestConfig.url}
          onChange={(e) => setRequestConfig((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="http://127.0.0.1:8000/api/v1/resource"
          className="flex-1 w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <button
          onClick={executeCurrentRequest}
          disabled={isExecuting}
          className="w-full sm:w-auto px-5 py-2 bg-[#49cc90] hover:bg-[#3dba80] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 select-none shadow"
        >
          <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-pulse' : ''}`} />
          {isExecuting ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all ${
            activeTab === 'params'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Params
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all ${
            activeTab === 'headers'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all ${
            activeTab === 'body'
              ? 'border-b-2 border-emerald-500 text-emerald-500'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          JSON Body
        </button>
      </div>

      {/* Body Tab */}
      {activeTab === 'body' && (
        <textarea
          rows={6}
          value={rawBodyText}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder='{\n  "name": "Sample Item",\n  "price": 29.99\n}'
          className="w-full p-3 font-mono text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      )}

      {/* Params Tab */}
      {activeTab === 'params' && (
        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 p-2">
          Query params are configured automatically in the parameters table above or directly in the URL bar.
        </div>
      )}

      {/* Headers Tab */}
      {activeTab === 'headers' && (
        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 p-2">
          Authorization header is configured in the <strong>Authorize</strong> modal on the top right.
        </div>
      )}
    </div>
  );
};
