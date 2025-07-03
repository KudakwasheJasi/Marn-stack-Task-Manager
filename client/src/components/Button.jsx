import clsx from "clsx";
import React from "react";

const Button = ({ 
  icon, 
  className, 
  label, 
  type = "button", 
  onClick,
  disabled = false 
}) => {
  return (
    <button
      type={type}
      className={clsx(
        "px-3 py-2 outline-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{label}</span>
      {icon && icon}
    </button>
  );
};

export default Button;