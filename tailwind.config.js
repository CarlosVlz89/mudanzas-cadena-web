/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cadena: {
          pink: '#E86BB1',   // Rosa del logo
          blue: '#3B8ED0',   // Azul del logo
          dark: '#000000',   // Fondo/Sombras
          white: '#FFFFFF',
        },
        ocean: {
          DEFAULT: '#007BC4', // Azul oceánico
          dark: '#008CA4',    // Petróleo
          light: '#3BAFFF',   // Cielo brillante
        },
        cyan: {
          vibrant: '#00B5D8', // Cian vibrante
          soft: '#79C7FF',    // Pastel
        }
      },
    },
  },
  plugins: [],
}