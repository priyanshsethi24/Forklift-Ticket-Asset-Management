import React from "react";

const Button = (props) => {
  const { menus, onClick, variant, children, type, ...prop } = props;

  const handleClick = (item, i) => {
    if (children) {
      if (type !== "submit") {
        onClick();
      }
    } else {
      onClick(item, i);
    }
  };

  // Base button styles with blue color
  const baseButtonClasses = "px-4 py-2 -md font-medium transition-colors text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 sm:text-sm md:text-base";
  
  // Variant styles
  const variantClasses = {
    outline: "bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50",
    close: "bg-transparent text-gray-500 hover:bg-gray-100 p-2 -full",
    default: ""
  };

  if (children) {
    return (
      <button
        className={`${baseButtonClasses} ${variantClasses[variant] || ""} w-full sm:w-auto`}
        onClick={handleClick}
        type={type || "button"}
        {...prop}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {menus?.map((item, i) => {
        return (
          <button
            key={i}
            className={`${baseButtonClasses} w-full sm:w-auto`}
            onClick={() => handleClick(item, i)}
            {...prop}
          >
            {item.text}
          </button>
        );
      })}
    </div>
  );
};

export default Button;