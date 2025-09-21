import React from 'react';

interface CustomInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  name,
  id,
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        name={name}
        id={id}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default CustomInput;