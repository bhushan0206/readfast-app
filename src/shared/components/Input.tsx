import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-neutral-400 dark:text-neutral-500">
              {leftIcon}
            </div>
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg py-2
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            border ${error ? 'border-error-500 dark:border-error-400' : 'border-neutral-300 dark:border-neutral-600'}
            bg-white dark:bg-neutral-800
            text-neutral-900 dark:text-neutral-100
            placeholder-neutral-500 dark:placeholder-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 focus:border-primary-500 dark:focus:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-neutral-400 dark:text-neutral-500">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

export default Input;