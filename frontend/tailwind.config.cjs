/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#EAB308', // Yellow-500
                secondary: '#10B981', // Emerald-500
                dark: {
                    900: '#0F172A', // Slate-900 (Background)
                    800: '#1E293B', // Slate-800 (Cards)
                    700: '#334155', // Slate-700 (Borders)
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
