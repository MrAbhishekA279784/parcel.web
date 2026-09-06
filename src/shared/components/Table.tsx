import React, { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found',
  emptyAction,
  onRowClick,
  className = ''
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-4 divide-y divide-zinc-100">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="py-3.5 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8">
        <EmptyState message={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-xs ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 first:pl-5 last:pr-5 ${col.className || ''}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-zinc-800">
          {data.map((row, rowIdx) => (
            <tr
              key={keyExtractor(row, rowIdx)}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors duration-100 ${
                onRowClick ? 'cursor-pointer hover:bg-zinc-50/80' : 'hover:bg-zinc-50/40'
              }`}
            >
              {columns.map((col, colIdx) => {
                let content: ReactNode = null;
                if (typeof col.accessor === 'function') {
                  content = col.accessor(row);
                } else if (col.accessor) {
                  content = String(row[col.accessor] ?? '—');
                }
                return (
                  <td key={colIdx} className={`py-3.5 px-4 first:pl-5 last:pr-5 ${col.className || ''}`}>
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
