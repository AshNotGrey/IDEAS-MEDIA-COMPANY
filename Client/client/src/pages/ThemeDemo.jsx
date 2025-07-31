import useTheme from "../hooks/useTheme.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

/**
 * ThemeDemo Component
 *
 * A demonstration component showing different ways to use the theme system.
 * This component showcases the useTheme hook and ThemeToggle component.
 *
 * @component
 * @returns {JSX.Element}
 */
// todo maybe we to display info about the theme system
export default function ThemeDemo() {
  const { theme, themeClasses, setCustomTheme, isDark } = useTheme();

  return (
    <div className='p-6 space-y-6 bg-ideas-white dark:bg-ideas-black text-black dark:text-white'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-2xl font-bold mb-6'>Theme System Demo</h1>

        {/* Current Theme Display */}
        <div className='card mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Current Theme</h2>
          <p className='text-sm mb-2'>
            Active theme:{" "}
            <span className='font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
              {theme}
            </span>
          </p>
          <p className='text-sm'>
            Is dark mode:{" "}
            <span className='font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
              {isDark ? "true" : "false"}
            </span>
          </p>
        </div>

        {/* Theme Toggle Examples */}
        <div className='card mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Theme Toggle Examples</h2>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='text-center'>
              <p className='text-sm mb-2'>Icon Only</p>
              <ThemeToggle size='md' variant='icon' />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>With Label</p>
              <ThemeToggle size='md' variant='button' showLabel={true} />
            </div>
            <div className='text-center'>
              <p className='text-sm mb-2'>Minimal</p>
              <ThemeToggle size='lg' variant='minimal' />
            </div>
          </div>
        </div>

        {/* Custom Theme Selection */}
        <div className='card mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Custom Themes</h2>
          <p className='text-sm mb-4'>Available themes: {themeClasses.join(", ")}</p>
          <div className='flex flex-wrap gap-2'>
            {themeClasses.map((themeName) => (
              <button
                key={themeName}
                onClick={() => setCustomTheme(themeName)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === themeName
                    ? "bg-ideas-accent text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Information */}
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>Theme System Features</h2>
          <ul className='text-sm space-y-2'>
            <li>
              • <strong>System Preference Detection:</strong> Automatically detects user's system
              theme preference
            </li>
            <li>
              • <strong>LocalStorage Persistence:</strong> Remembers user's theme choice across
              sessions
            </li>
            <li>
              • <strong>GSAP Animations:</strong> Smooth icon rotation animations on theme toggle
            </li>
            <li>
              • <strong>Custom Themes:</strong> Support for seasonal themes (Halloween, Christmas)
            </li>
            <li>
              • <strong>Responsive Design:</strong> Works seamlessly across all screen sizes
            </li>
            <li>
              • <strong>Accessibility:</strong> Proper ARIA labels and keyboard navigation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
