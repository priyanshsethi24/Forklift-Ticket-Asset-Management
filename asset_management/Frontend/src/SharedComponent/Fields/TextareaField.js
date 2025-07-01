import React, { useMemo } from "react";

const TextareaField = (props) => {
  const {
    name,
    value,
    onChange,
    label,
    placeholder,
    required,
    rows = 2,
    errors,
  } = props;

  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  const hasError = useMemo(() => {
    return errors?.[name];
  }, [errors, name]);

  return (
    <div className={`mb-4 w-full ${hasError ? 'text-red-500' : 'text-gray-700'}`}>
      <div className="mb-1 text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none 
          ${hasError 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
          } 
          text-sm sm:text-base transition-colors duration-200`}
        required={required}
        placeholder={placeholder}
      />
      {hasError && (
        <div className="mt-1 text-xs sm:text-sm text-red-500">{errors?.[name]}</div>
      )}
    </div>
  );
};

export default TextareaField;