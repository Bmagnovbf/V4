import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        red: {
          primary: '#8B0000',
          medium:  '#C00000',
          soft:    '#F4CCCC',
        },
        green: {
          primary: '#1A5C38',
          soft:    '#D9EAD3',
        },
        amber: '#D4900A',
        ink: {
          black:    '#1A1A1A',
          dark:     '#3D3D3D',
          mid:      '#7A7A7A',
          light:    '#F2F2F2',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
