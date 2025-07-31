import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";

/**
 * FormInput component
 *
 * Reusable input component for authentication forms with
 * react-hook-form integration, theme support, validation states, and password toggle.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} [props.placeholder] - Input placeholder
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.rest] - Additional props passed to input
 *
 * @example
 * ```jsx
 * <FormInput
 *   label="Email"
 *   type="email"
 *   name="email"
 *   placeholder="Enter your email"
 *   error={errors.email?.message}
 *   {...register("email")}
 *   required
 * />
 * ```
 */
const FormInput = forwardRef(
  (
    {
      label,
      type = "text",
      name,
      placeholder,
      required = false,
      disabled = false,
      error,
      className = "",
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = type === "password" && showPassword ? "text" : type;

    // Use theme hook to ensure proper theme state initialization
    useTheme();

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        <label
          htmlFor={name}
          className='block text-sm font-medium text-ideas-black dark:text-ideas-white'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        {/* Input Container */}
        <div className='relative'>
          <input
            ref={ref}
            id={name}
            type={inputType}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 rounded-lg border transition-all duration-200
              ${disabled ? "input-disabled" : "input"}
              ${error ? "input-error" : ""}
            `}
            {...rest}
          />

          {/* Password Toggle */}
          {type === "password" && (
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-ideas-black dark:hover:text-ideas-white transition-colors'>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && <p className='text-sm text-red-500 dark:text-red-400'>{error}</p>}
      </div>
    );
  }
);

/**
 * Checkbox component
 *
 * Reusable checkbox component for forms with consistent styling.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Checkbox name attribute
 * @param {string} [props.label] - Checkbox label
 * @param {boolean} [props.required=false] - Required field
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.error] - Error message
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.rest] - Additional props passed to input
 *
 * @example
 * ```jsx
 * <Checkbox
 *   name="acceptTerms"
 *   label="I agree to the terms"
 *   error={errors.acceptTerms?.message}
 *   {...register("acceptTerms")}
 * />
 * ```
 */
const Checkbox = forwardRef(
  ({ name, label, required = false, disabled = false, error, className = "", ...rest }, ref) => {
    // Use theme hook to ensure proper theme state initialization
    useTheme();

    return (
      <div className={`space-y-2 ${className}`}>
        <label className='flex items-start'>
          <input
            ref={ref}
            type='checkbox'
            name={name}
            disabled={disabled}
            required={required}
            className='checkbox mt-0.5'
            {...rest}
          />
          {label && (
            <span className='ml-2 text-sm text-ideas-black dark:text-ideas-white'>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </span>
          )}
        </label>
        {error && <p className='text-sm text-red-500 dark:text-red-400 ml-6'>{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
Checkbox.displayName = "Checkbox";

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export { FormInput, Checkbox };
export default FormInput;
