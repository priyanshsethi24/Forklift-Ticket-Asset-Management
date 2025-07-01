import React from 'react';

const CheckboxGroup = ({ name, options, onChange, label }) => {
  return (
    <div>
      <label>{label}</label>
      {options.map((option) => (
        <div key={option}>
          <input
            type="checkbox"
            name={name}
            value={option}
            onChange={onChange}
          />
          {option}
        </div>
      ))}
    </div>
  );
};

export default CheckboxGroup;