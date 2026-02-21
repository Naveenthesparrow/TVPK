/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#D71920", // Red from screenshot
                secondary: "#FDC010", // Yellow/Gold from screenshot
                dark: "#1A1A1A",
                light: "#F5F5F5",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                header: ['Outfit', 'sans-serif'],
                tamil: ['"Noto Sans Tamil"', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
