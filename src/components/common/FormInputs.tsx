import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  registration, 
  className = '', 
  icon,
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`}>
      <label className="text-sm font-mono tracking-wide text-graphite/80 uppercase">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite/40 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...registration}
          {...props}
          className={`
            w-full bg-vellum/50 border border-graphite/20 px-3 py-2.5 font-body
            focus:outline-none focus:border-linework focus:bg-vellum/80
            transition-all duration-200 placeholder:text-graphite/30
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-signal-red/50 focus:border-signal-red' : ''}
          `}
        />
      </div>
      {error && (
        <span className="text-signal-red text-sm font-body mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  registration: UseFormRegisterReturn;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, registration, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label className="font-mono text-xs tracking-widest text-graphite/70 uppercase">
        {label}
      </label>
      <select
        {...registration}
        {...props}
        className={`
          bg-transparent border-b-2 outline-none py-2 font-body text-graphite transition-colors
          ${error ? 'border-signal-red focus:border-signal-red' : 'border-graphite/20 focus:border-linework'}
          disabled:opacity-50 appearance-none
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-signal-red text-sm font-body mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
