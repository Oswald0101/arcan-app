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
        background:         'hsl(var(--background))',
        surface:            'hsl(var(--surface))',
        'surface-elevated': 'hsl(var(--surface-elevated))',
        'surface-overlay':  'hsl(var(--surface-overlay))',
        foreground:         'hsl(var(--foreground))',
        'foreground-dim':   'hsl(var(--foreground-dim))',
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          bright:  'hsl(var(--border-bright))',
        },
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          dim:        'hsl(var(--accent-dim))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: 'hsl(var(--success))',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        orbit: {
          from: { transform: 'rotate(0deg) translateX(36px) rotate(0deg)' },
          to:   { transform: 'rotate(360deg) translateX(36px) rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer:      'shimmer 1.8s linear infinite',
        'fade-up':    'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':    'fade-in 0.35s ease both',
        'scale-in':   'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'spin-slow':  'spin-slow 14s linear infinite',
        orbit:        'orbit 10s linear infinite',
        float:        'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
