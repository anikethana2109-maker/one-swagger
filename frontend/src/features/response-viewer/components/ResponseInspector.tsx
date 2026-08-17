import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { JsonTreeViewer } from './JsonTreeViewer';
import { HeadersTable } from './HeadersTable';
import { Clock, HardDrive, CheckCircle, AlertTriangle } from 'lucide-react';

export const ResponseInspector: React.FC = () => {
  const { responseResult } = useApp();
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!responseResult) return null;

  const isSuccess = responseResult.status >= 200 && responseResult.status < 300;
  const statusColor = isSuccess ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/15 text-rose-500 border-rose-500/30';

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-md space-y-3 mt-4">
      {/* Response Header Status Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${statusColor} flex items-center gap-1.5`}>
            {isSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {responseResult.status} {responseResult.statusText}
          </span>

          <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {responseResult.latencyMs} ms
          </span>

          <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5" />
            {(responseResult.sizeBytes / 1024).toFixed(2)} KB
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'body'
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Response Body
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'headers'
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Headers ({Object.keys(responseResult.headers || {}).length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'body' ? (
        <JsonTreeViewer data={responseResult.data || responseResult.rawText} />
      ) : (
        <HeadersTable headers={responseResult.headers} />
      )}
    </div>
  );
};
