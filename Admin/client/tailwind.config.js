/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                admin: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    bg: '#f8fafc',
                    sidebar: '#1e293b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
} 