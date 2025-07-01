import React, { useMemo } from "react";

const InputField = (props) => {
  const {
    name,
    value,
    onChange,
    label,
    placeholder,
    required,
    explanation,
    type,
    errors,
    disabled,
    maxLength
  } = props;

  const handleChange = (e) => {
    let value = e.target.value;
    if (value && type === "number") {
      value = parseInt(e.target.value);
    }
    if (type === "date" && value) {
      const date = new Date(value);
      const year = date.getFullYear();

      if (isNaN(date.getTime()) || year < 2000 || year > 3000) {
        const error = {
          target: {
            name,
            value,
            validationMessage: "Please enter a date between years 2000-3000",
          },
        };
        onChange(error);
        return;
      }
    }
    onChange({ target: { name, value } });
  };

  const hasError = useMemo(() => {
    return errors?.[name];
  }, [errors, name]);

  return (
    <div className={`w-full  ${hasError ? 'border-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {label} {required && <span className="text-red-500 ">*</span>}
          <div className="relative ml-2 group">
            <svg className="w-4 h-4 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs  p-2 w-48 z-10">
              {explanation}
            </div>
          </div>
        </div>
      </div>
      <input
        type={type || "text"}
        value={value}
        onChange={handleChange}
        className={`w-full px-3 py-2 border  focus:outline-none focus:ring-2 
          ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} 
          ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}
          transition-all duration-200 text-sm sm:text-base`}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        {...(type === "date" && (name === "reconditioning_date") && {
          min: new Date().toISOString().slice(0, 10),
          max: new Date(new Date().setFullYear(new Date().getFullYear() + 100))
            .toISOString()
            .slice(0, 10),
        })}
        {...(type === "date" && (name !== "reconditioning_date") && {
          min: "2000-01-01",
          max: "3000-12-31",
        })}
        {...(type === "month" && {
          min: new Date().getFullYear() - 100 + "-01",
          max: new Date().toISOString().slice(0, 7),
        })}
      />
      {hasError && (
        <div className="text-red-500 text-sm mt-1">{errors?.[name]}</div>
      )}
    </div>
  );
};

export default InputField;