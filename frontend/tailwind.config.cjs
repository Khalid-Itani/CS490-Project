/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // primary body font
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        // headings
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      // A small, readable typographic scale (adjust sizes to taste)
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        'h2': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        'h3': ['1.5rem', { lineHeight: '2rem' }], // 24px
        'h4': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        'h5': ['1.125rem', { lineHeight: '1.5rem' }], // 18px
        'h6': ['1rem', { lineHeight: '1.25rem' }], // 16px
        'body': ['1rem', { lineHeight: '1.75rem' }], // 16px body
        'caption': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      },
      fontWeight: {
        hairline: '100',
        light: '300',
        normal: '400',
        semibold: '600',
        bold: '700',
      },
    }
  },
  plugins: [],
}