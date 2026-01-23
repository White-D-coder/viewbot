/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'hacker-green': '#0f0',
                'hacker-bg': '#0a0a0a',
            }
        },
    },
    plugins: [],
}
