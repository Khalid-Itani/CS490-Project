/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Primary: Inter; Secondary (headings): Source Serif 4
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      // optional: tweak default leading for comfy reading
      lineHeight: {
        snug: '1.35',
        comfy: '1.7',
      },
      // optional: headline scale
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],   // 32px
        'h2': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],// 24px
        'h3': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],// 20px
      },
    },
  },
  plugins: [],
};
