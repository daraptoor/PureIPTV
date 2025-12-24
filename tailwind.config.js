/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          gray: '#8E8E93',
          background: {
            light: '#F2F2F7',
            dark: '#000000',
          },
          card: {
            light: '#FFFFFF',
            dark: '#1C1C1E',
          },
        },
      },
      borderRadius: {
        ios: '10px',
      },
    },
  },
  plugins: [],
}

