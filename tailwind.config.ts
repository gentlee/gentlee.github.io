import type {Config} from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        focus: 'var(--focus)',

        npm: 'var(--npm)',
        github: 'var(--github)',
        instagram: 'var(--instagram)',
        linkedin: 'var(--linkedin)',
        email: 'var(--email)',
        habr: 'var(--habr)',
      },
    },
  },
  plugins: [],
} satisfies Config
