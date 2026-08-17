import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface JsonTreeViewerProps {
  data: any;
}

export const JsonTreeViewer: React.FC<JsonTreeViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all z-10"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>

      <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
        <code>{jsonString}</code>
      </pre>
    </div>
  );
};
