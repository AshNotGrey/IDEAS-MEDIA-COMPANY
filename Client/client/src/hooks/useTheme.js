import { useEffect, useState, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Custom React hook for managing application theme (light, dark, or custom/seasonal themes).
 * 
 * - Uses system preference by default, but allows user override via localStorage.
 * - Supports custom/seasonal themes by updating the themeClasses array.
 * - Applies the selected theme as a class on the <html> element.
 * - Listens for system theme changes if no user override is set.
 * - Includes GSAP animation support for theme toggle effects.
 *
 * @returns {Object} Theme management API:
 *   @property {string} theme - The current theme name.
 *   @property {string[]} themeClasses - Array of all available theme class names.
 *   @property {function} toggleTheme - Toggles between "light" and "dark" themes.
 *   @property {function} setCustomTheme - Sets a custom theme by name (must be in themeClasses).
 *   @property {number} spin - Current spin state for animations.
 *   @property {React.RefObject} themeIconRef - Ref for theme icon animations.
 */
export default function useTheme() {
    /**
     * Array of all available theme class names.
     * @type {string[]}
     */
    const themeClasses = useMemo(() => ['light', 'dark', 'halloween', 'christmas'], []);

    /**
     * Determines the preferred theme: user preference from localStorage or system preference.
     * @returns {string} The preferred theme name.
     */
    const getPreferredTheme = () => {
        const storedTheme = localStorage.getItem("idealPhotographyTheme");
        if (storedTheme && themeClasses.includes(storedTheme)) return storedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    /**
     * The current theme state.
     * @type {[string, function]}
     */
    const [theme, setTheme] = useState(getPreferredTheme);

    /**
     * Spin state for theme icon animations.
     * @type {[number, function]}
     */
    const [spin, setSpin] = useState(0);

    /**
     * Ref for theme icon animations.
     * @type {React.RefObject}
     */
    const themeIconRef = useRef(null);

    // GSAP animation for theme icon rotation
    useGSAP(() => {
        if (themeIconRef.current) {
            gsap.to(themeIconRef.current, {
                rotate: spin,
                duration: 0.5,
                ease: "power2.inOut",
            });
        }
    }, [spin]);

    // Apply the current theme class to the <html> element.
    useEffect(() => {
        document.documentElement.classList.remove(...themeClasses);
        document.documentElement.classList.add(theme);
        // Store only if user explicitly toggles (see toggleTheme)
    }, [theme, themeClasses]);

    /**
     * Toggles between "light" and "dark" themes and saves preference to localStorage.
     */
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.classList.remove(...themeClasses);
        document.documentElement.classList.add(newTheme);
        localStorage.setItem("idealPhotographyTheme", newTheme); // User override
        setTheme(newTheme);
        setSpin((prev) => prev + 180); // Trigger animation
    };

    /**
     * Sets a custom theme by name (must be in themeClasses) and saves preference to localStorage.
     * @param {string} themeName - The name of the theme to apply.
     */
    const setCustomTheme = (themeName) => {
        if (!themeClasses.includes(themeName)) return;
        document.documentElement.classList.remove(...themeClasses);
        document.documentElement.classList.add(themeName);
        localStorage.setItem("idealPhotographyTheme", themeName);
        setTheme(themeName);
        setSpin((prev) => prev + 180); // Trigger animation
    };

    // Listen for system preference changes if no user override is set.
    useEffect(() => {
        const storedTheme = localStorage.getItem("idealPhotographyTheme");
        if (storedTheme) return; // Don't react if user has set a preference

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            setTheme(mediaQuery.matches ? "dark" : "light");
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return {
        theme,
        themeClasses,
        toggleTheme,
        setCustomTheme,
        spin,
        themeIconRef,
        isDark: theme === "dark"
    };
} 