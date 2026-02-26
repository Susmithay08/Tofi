import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const THEMES = {
    amber: {
        name: 'Amber',
        '--bg': '#fdf6ec',
        '--bg2': '#fef9f2',
        '--sidebar-bg': 'rgba(255,248,235,0.85)',
        '--glass': 'rgba(255,248,235,0.70)',
        '--glass-border': 'rgba(255,210,140,0.50)',
        '--accent': '#d47c2f',
        '--accent-hover': '#b8621a',
        '--accent-light': '#f5c06a',
        '--accent-bg': 'rgba(212,124,47,0.10)',
        '--accent-border': 'rgba(212,124,47,0.25)',
        '--text-primary': '#1a1208',
        '--text-secondary': '#4a3520',
        '--text-muted': '#8a7060',
        '--orb1': 'rgba(232,148,58,0.18)',
        '--orb2': 'rgba(245,192,106,0.14)',
        '--orb3': 'rgba(184,98,26,0.10)',
        '--user-bubble': 'rgba(212,124,47,0.10)',
        '--user-border': 'rgba(212,124,47,0.22)',
        '--msg-bubble': 'rgba(255,248,235,0.75)',
        '--msg-border': 'rgba(255,210,140,0.55)',
        '--input-bg': 'rgba(255,248,235,0.80)',
        '--input-border': 'rgba(255,210,140,0.60)',
        '--divider': 'rgba(255,210,140,0.40)',
    },
    dark: {
        name: 'Dark',
        '--bg': '#1a1a1a',
        '--bg2': '#222222',
        '--sidebar-bg': 'rgba(28,28,28,0.95)',
        '--glass': 'rgba(35,35,35,0.85)',
        '--glass-border': 'rgba(255,255,255,0.08)',
        '--accent': '#d47c2f',
        '--accent-hover': '#e8943a',
        '--accent-light': '#f5c06a',
        '--accent-bg': 'rgba(212,124,47,0.12)',
        '--accent-border': 'rgba(212,124,47,0.30)',
        '--text-primary': '#f0ece4',
        '--text-secondary': '#b8a898',
        '--text-muted': '#6a5a4a',
        '--orb1': 'rgba(212,124,47,0.08)',
        '--orb2': 'rgba(184,98,26,0.06)',
        '--orb3': 'rgba(245,192,106,0.05)',
        '--user-bubble': 'rgba(212,124,47,0.15)',
        '--user-border': 'rgba(212,124,47,0.30)',
        '--msg-bubble': 'rgba(40,38,35,0.90)',
        '--msg-border': 'rgba(255,255,255,0.07)',
        '--input-bg': 'rgba(30,28,25,0.90)',
        '--input-border': 'rgba(255,255,255,0.10)',
        '--divider': 'rgba(255,255,255,0.07)',
    },
    light: {
        name: 'Light',
        '--bg': '#f8f8f6',
        '--bg2': '#ffffff',
        '--sidebar-bg': 'rgba(250,250,248,0.95)',
        '--glass': 'rgba(255,255,255,0.80)',
        '--glass-border': 'rgba(0,0,0,0.08)',
        '--accent': '#d47c2f',
        '--accent-hover': '#b8621a',
        '--accent-light': '#f5c06a',
        '--accent-bg': 'rgba(212,124,47,0.08)',
        '--accent-border': 'rgba(212,124,47,0.20)',
        '--text-primary': '#111111',
        '--text-secondary': '#444444',
        '--text-muted': '#888888',
        '--orb1': 'rgba(212,124,47,0.07)',
        '--orb2': 'rgba(245,192,106,0.08)',
        '--orb3': 'rgba(184,98,26,0.05)',
        '--user-bubble': 'rgba(212,124,47,0.08)',
        '--user-border': 'rgba(212,124,47,0.18)',
        '--msg-bubble': 'rgba(255,255,255,0.90)',
        '--msg-border': 'rgba(0,0,0,0.07)',
        '--input-bg': 'rgba(255,255,255,0.95)',
        '--input-border': 'rgba(0,0,0,0.10)',
        '--divider': 'rgba(0,0,0,0.07)',
    },
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('tofi-theme') || 'amber')

    useEffect(() => {
        const vars = THEMES[theme]
        const root = document.documentElement
        Object.entries(vars).forEach(([k, v]) => {
            if (k.startsWith('--')) root.style.setProperty(k, v)
        })
        root.style.setProperty('--font-display', "'Cormorant Garamond', Georgia, serif")
        root.style.setProperty('--font-body', "'DM Sans', sans-serif")
        root.style.setProperty('--font-mono', "'DM Mono', monospace")
        document.body.style.background = vars['--bg']
        localStorage.setItem('tofi-theme', theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)