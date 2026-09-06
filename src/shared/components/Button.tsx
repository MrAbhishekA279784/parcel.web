import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'teal' | 'indigo' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-xs active:scale-[0.99]',
    secondary: 'bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 shadow-xs',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs active:scale-[0.99]',
    orange: 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs active:scale-[0.99]',
    teal: 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs active:scale-[0.99]',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs active:scale-[0.99]'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
