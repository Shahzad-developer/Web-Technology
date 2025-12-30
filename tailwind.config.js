/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./pages/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./context/**/*.{js,jsx}",
        "./App.jsx",
        "./main.jsx",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#135bec",
                "primary-dark": "#0f4bc2",
                "background-dark": "#101622",
                "surface-dark": "#1e2736",
                "input-dark": "#232f48",
                "border-dark": "#324467",
                "text-secondary": "#92a4c9",
                "card-dark": "#1e232e",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
