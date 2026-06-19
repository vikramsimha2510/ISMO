import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-graphite text-vellum hover:bg-deepline hover:shadow-[2px_2px_0px_var(--linework)] active:translate-y-px active:translate-x-px active:shadow-none border border-transparent",
    secondary: "bg-transparent text-graphite border border-graphite/20 hover:border-graphite hover:bg-graphite/5",
    danger: "bg-signal-red/10 text-signal-red hover:bg-signal-red hover:text-vellum border border-signal-red/20",
    ghost: "bg-transparent text-graphite/60 hover:text-graphite hover:bg-graphite/5",
    gradient: "bg-gradient-to-r from-linework to-[#3DA9C1] hover:from-[#7FD4E8] hover:to-linework shadow-[0_0_15px_rgba(94,200,224,0.3)] hover:shadow-[0_0_25px_rgba(94,200,224,0.5)] text-deepline font-bold border-none",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
