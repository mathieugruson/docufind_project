import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './renderer/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
    // https://tailwind-scrollbar-example.adoxography.repl.co/
],
  variants: {
    scrollbar: ['rounded']
}
}

export default config
