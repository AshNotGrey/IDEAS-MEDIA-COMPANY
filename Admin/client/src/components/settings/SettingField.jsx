import React, { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

const SettingField = ({ setting, value, onChange, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Validate value against setting constraints
  const validateValue = (val) => {
    const validation = setting.validation || {};

    if (validation.required && (val === null || val === undefined || val === "")) {
      return "This field is required";
    }

    if (setting.type === "number" && val !== "" && val !== null && val !== undefined) {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        return "Must be a valid number";
      }
      if (validation.min !== undefined && numVal < validation.min) {
        return `Value must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && numVal > validation.max) {
        return `Value must be at most ${validation.max}`;
      }
    }

    if (setting.type === "string" && val) {
      if (validation.minLength && val.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && val.length > validation.maxLength) {
        return `Must be at most ${validation.maxLength} characters`;
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(val)) {
          return "Value does not match required pattern";
        }
      }
    }

    if (validation.enum && validation.enum.length > 0) {
      if (!validation.enum.includes(val)) {
        return `Value must be one of: ${validation.enum.join(", ")}`;
      }
    }

    return "";
  };

  const handleChange = (newValue) => {
    const error = validateValue(newValue);
    setValidationError(error);
    onChange(newValue);
  };

  const renderInput = () => {
    const commonProps = {
      disabled,
      className: `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
        validationError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
      }`,
    };

    switch (setting.ui?.inputType || setting.type) {
      case "boolean":
        return (
          <div className='flex items-center'>
            <button
              type='button'
              onClick={() => handleChange(!value)}
              disabled={disabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                value ? "bg-blue-600" : "bg-gray-200"
              }`}>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className='ml-3 text-sm text-gray-700'>{value ? "Enabled" : "Disabled"}</span>
          </div>
        );

      case "select":
        return (
          <select
            {...commonProps}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}>
            <option value=''>Select an option...</option>
            {(setting.ui?.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {setting.validation?.enum &&
              !setting.ui?.options &&
              setting.validation.enum.map((enumValue) => (
                <option key={enumValue} value={enumValue}>
                  {enumValue}
                </option>
              ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            {...commonProps}
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.ui?.placeholder}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          />
        );

      case "password":
        return (
          <div className='relative'>
            <input
              {...commonProps}
              type={showPassword ? "text" : "password"}
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={setting.ui?.placeholder}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
              disabled={disabled}>
              {showPassword ? (
                <EyeOff className='h-4 w-4 text-gray-400' />
              ) : (
                <Eye className='h-4 w-4 text-gray-400' />
              )}
            </button>
          </div>
        );

      case "number":
        return (
          <input
            {...commonProps}
            type='number'
            value={value || ""}
            onChange={(e) => handleChange(e.target.value === "" ? null : Number(e.target.value))}
            placeholder={setting.ui?.placeholder}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );

      case "email":
        return (
          <input
            {...commonProps}
            type='email'
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.ui?.placeholder}
          />
        );

      case "url":
        return (
          <input
            {...commonProps}
            type='url'
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.ui?.placeholder}
          />
        );

      case "json":
        return (
          <textarea
            {...commonProps}
            value={value ? JSON.stringify(value, null, 2) : ""}
            onChange={(e) => {
              try {
                const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                handleChange(parsed);
              } catch (error) {
                setValidationError("Invalid JSON format");
              }
            }}
            placeholder={setting.ui?.placeholder || "Enter valid JSON..."}
            rows={6}
            className={`${commonProps.className} resize-vertical font-mono text-sm`}
          />
        );

      case "file":
        return (
          <div className='space-y-2'>
            <input
              type='file'
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Here you would typically upload the file and get a URL
                  // For now, we'll just use the file name
                  handleChange(file.name);
                }
              }}
              disabled={disabled}
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            {value && <div className='text-sm text-gray-600'>Current: {value}</div>}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type='text'
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={setting.ui?.placeholder}
          />
        );
    }
  };

  return (
    <div className='space-y-2'>
      {renderInput()}

      {/* Validation Error */}
      {validationError && (
        <div className='flex items-center text-sm text-red-600'>
          <X className='h-4 w-4 mr-1' />
          {validationError}
        </div>
      )}

      {/* Validation Success */}
      {!validationError && value !== undefined && value !== "" && setting.validation?.required && (
        <div className='flex items-center text-sm text-green-600'>
          <Check className='h-4 w-4 mr-1' />
          Valid
        </div>
      )}

      {/* Additional Info */}
      {setting.type === "string" && setting.validation && (
        <div className='text-xs text-gray-500'>
          {setting.validation.minLength && setting.validation.maxLength && (
            <span>
              Length: {setting.validation.minLength}-{setting.validation.maxLength} characters
            </span>
          )}
          {setting.validation.pattern && (
            <span className='block'>Pattern: {setting.validation.pattern}</span>
          )}
        </div>
      )}

      {setting.type === "number" && setting.validation && (
        <div className='text-xs text-gray-500'>
          {setting.validation.min !== undefined && setting.validation.max !== undefined && (
            <span>
              Range: {setting.validation.min} - {setting.validation.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingField;
