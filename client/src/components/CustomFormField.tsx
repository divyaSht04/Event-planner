import React from 'react';

interface CustomFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea';
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  helperText?: string;
}

const CustomFormField: React.FC<CustomFormFieldProps> = ({
  type = 'text',
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  helperText,
}) => {
  const baseInputClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
  const normalClasses = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const errorClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500';
  const disabledClasses = 'bg-gray-100 cursor-not-allowed text-gray-500';

  const inputClasses = `${baseInputClasses} ${error ? errorClasses : normalClasses} ${disabled ? disabledClasses : 'bg-white'} ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomFormField;