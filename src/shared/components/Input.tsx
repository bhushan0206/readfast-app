import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg shadow-sm 
              ${leftIcon ? 'pl-10' : 'pl-3'} 
              ${rightIcon ? 'pr-10' : 'pr-3'} 
              py-2
              border ${error ? 'border-error-500' : 'border-neutral-300'} 
              focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500
              transition-all
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-sm text-error-600">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;