import React from 'react';

interface HeadersTableProps {
  headers: Record<string, string>;
}

export const HeadersTable: React.FC<HeadersTableProps> = ({ headers }) => {
  const entries = Object.entries(headers || {});

  if (entries.length === 0) {
    return <div className="text-xs text-zinc-500 font-mono p-3">No headers returned</div>;
  }

  return (
    <div className="w-full overflow-x-auto max-h-60 overflow-y-auto font-mono text-xs">
      <table className="w-full text-left">
        <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] uppercase">
          <tr>
            <th className="px-3 py-1.5">Header Key</th>
            <th className="px-3 py-1.5">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td className="px-3 py-1.5 font-bold text-zinc-700 dark:text-zinc-300">{k}</td>
              <td className="px-3 py-1.5 text-zinc-500 dark:text-zinc-400 break-all">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
