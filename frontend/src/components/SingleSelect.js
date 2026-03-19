import { DropDownCloseIcon, DropDownOpenIcon, CheckIcon } from "../static/Icons";
import "../styles/globals.css";
import { useState } from "react";

const SingleSelect = ({ options, label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption?.label ?? "Select an option";

  return (
    <div className="select-container">
      <div className="select-dropdown">
        <span className="dropdown-title">{label}</span>
        {selectedLabel}
        <div className="select-icon-container" onClick={() => setIsOpen(!isOpen)} style={{fontSize: '16px'}}>
          {isOpen ? <DropDownCloseIcon /> : <DropDownOpenIcon />}
        </div>
      </div>
      {isOpen && <div className="select-dropdown-menu">
        {options.map(option => (
          <div
            key={option.value}
            className={`select-dropdown-menu-item${option.value === value ? " selected" : ""}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
            {option.value === value && (
              <div className="select-icon-container" style={{fontSize: '16px'}}>
                <CheckIcon />
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
};

export default SingleSelect;
