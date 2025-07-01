import React, { useMemo } from "react";

const SelectField = (props) => {
  const { 
    name, 
    value, 
    onChange, 
    label, 
    menus, 
    placeholder, 
    required, 
    errors, 
    explanation,
    disabled 
  } = props;

  const handleChange = (e) => {
    let value = e.target.value;
    onChange({ target: { name, value } });
  };

  const hasError = useMemo(() => {
    return errors?.[name];
  }, [errors, name]);

  return (
    <div className={`w-full mb-4 ${hasError ? 'text-red-500' : 'text-gray-700'}`}>
      <div className="flex items-center mb-1 text-sm font-medium">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
        {explanation && (
          <div className="relative inline-block ml-1 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded w-48 -translate-x-1/2 left-1/2 mt-1">
              {explanation}
            </div>
          </div>
        )}
      </div>
      <select
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-[.75rem] border rounded-md focus:outline-none focus:ring-2 ${
          hasError 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        } bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors text-sm`}
        disabled={disabled}
      >
        {menus?.map((item, i) => (
          <option key={i} value={item.value}>
            {item.option}
          </option>
        ))}
      </select>
      {hasError && (
        <div className="mt-1 text-sm text-red-500">{errors?.[name]}</div>
      )}
    </div>
  );
};

export default SelectField;