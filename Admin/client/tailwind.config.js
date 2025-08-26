import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                ideas: {
                    white: '#FFFFFF',         // Light background
                    lightInput: '#F2F2F2',     // Light form fields
                    black: '#0D0D0D',         // Dark background
                    darkInput: '#0A0A0A',      // Dark form fields
                    accent: '#A24CF3',         // Main accent
                    accentHover: '#7E2CD8',    // Hover state
                    accentLight: '#C793FA',    // Lighter tint (optional)
                    accentDisabled: '#D8B7F7'  // Disabled variant
                }
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                heading: ['Georgia', ...defaultTheme.fontFamily.serif],
            },
            spacing: {
                gutter: '1.5rem',
                section: '4rem',
            },
            boxShadow: {
                card: '0 2px 6px rgba(0, 0, 0, 0.06)',
                cardDark: '0 2px 6px rgba(0, 0, 0, 0.25)',
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem'
            },
            screens: {
                xs: '480px'
            }
        }
    },
    plugins: []
};
