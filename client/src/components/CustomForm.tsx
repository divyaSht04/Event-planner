import React from 'react';

interface CustomFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

const CustomForm: React.FC<CustomFormProps> = ({
  children,
  onSubmit,
  title,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
};

export default CustomForm;