module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          onBackground: '#E0E0E0',
          onSurface: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
