import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          'color-scheme': 'light',
          // Main colors
          primary: '#343433',
          'primary-content': '#ffffff',
          secondary: '#b2a79a',
          'secondary-content': '#ffffff',
          // Subsidised colors
          accent: '#6187fe',
          'accent-content': '#d4deff',
          neutral: '#747485',
          'neutral-content': '#ffffff',
          // Informative colors
          info: '#e9f2ff',
          'info-content': '#0086fc',
          success: '#e3eee2',
          'success-content': '#00C454',
          error: '#fff0f0',
          'error-content': '#ff4e4e',
          warning: '#fefae6',
          'warning-content': '#f6c30f',
          // Base colors
          'base-100': '#ffffff',
          'base-200': '#fbfaf9',
          'base-300': '#f7f4f3',
          'base-content': '#474645',
        },
        dark: {
          'color-scheme': 'dark',
        },
      },
    ],
  },
}

export default config
