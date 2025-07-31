import { Sun, Moon } from "lucide-react";
import useTheme from "../hooks/useTheme.js";

/**
 * ThemeToggle Component
 *
 * A reusable theme toggle button that switches between light and dark modes.
 * Uses the useTheme hook for state management and includes GSAP animations.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size] - Size of the button ('sm', 'md', 'lg')
 * @param {boolean} [props.showLabel] - Whether to show the theme label
 * @param {string} [props.variant] - Button variant ('icon', 'button', 'minimal')
 * @returns {JSX.Element}
 */
export default function ThemeToggle({
  className = "",
  size = "md",
  showLabel = false,
  variant = "icon",
}) {
  const { toggleTheme, themeIconRef, isDark } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variants = {
    icon: `
      ${sizeClasses[size]}
      text-black dark:text-white 
      p-1 hover:bg-gray-100 dark:hover:bg-gray-800 
      rounded-md transition-colors
    `,
    button: `
      flex items-center gap-2 px-3 py-2
      text-black dark:text-white 
      hover:bg-gray-100 dark:hover:bg-gray-800 
      rounded-md transition-colors
    `,
    minimal: `
      ${sizeClasses[size]}
      text-black dark:text-white 
      hover:opacity-80 
      transition-opacity
    `,
  };

  const buttonClass = `${variants[variant]} ${className}`;

  return (
    <button
      onClick={toggleTheme}
      className={buttonClass}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <span ref={themeIconRef} className='inline-block'>
        {isDark ? <Sun className={iconSizes[size]} /> : <Moon className={iconSizes[size]} />}
      </span>
      {showLabel && <span className='text-sm font-medium'>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
