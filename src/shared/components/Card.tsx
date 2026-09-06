import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  title,
  subtitle,
  action
}) => {
  return (
    <div className={`bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden ${className}`}>
      {(header || title || action) && (
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between gap-4">
          {header ? (
            header
          ) : (
            <div>
              {title && <h3 className="text-base font-semibold text-zinc-900 leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
            </div>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );
};
