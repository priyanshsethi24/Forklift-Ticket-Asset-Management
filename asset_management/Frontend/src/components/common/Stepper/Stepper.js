import React from 'react';
import PropTypes from 'prop-types';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-grow flex-shrink-0 sm:flex-grow-0">
          <div className="flex flex-col items-center">
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium mb-1 ${
                index < currentStep ? 'bg-blue-500' : 
                index === currentStep ? 'bg-blue-500 ring-4 ring-blue-200' : 
                'bg-gray-300'
              }`}
              style={{ backgroundColor: index <= currentStep ? '#007bff' : undefined }}
            >
              {index + 1}
            </div>
            <span className={`text-xs sm:text-sm md:text-base ${index === currentStep ? 'font-medium' : ''}`}>
              {step.title}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`flex-grow h-0.5 mx-2 sm:mx-4 ${index < currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                 style={{ backgroundColor: index < currentStep ? '#007bff' : undefined }}></div>
          )}
        </div>
      ))}
    </div>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    optional: PropTypes.bool,
  })).isRequired,
  currentStep: PropTypes.number.isRequired,
};

export default Stepper;