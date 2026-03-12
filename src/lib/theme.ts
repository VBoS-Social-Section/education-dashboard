/**
 * Dashboard theme - slate/blue palette from design reference.
 * Dark base (#3E4050), light surface (#F0F1F2), vibrant accents.
 */
export const THEME = {
  baseDark: '#3E4050',       // sidebar / dark surfaces
  baseDarker: '#262E3B',     // darkest accent
  surface: '#F0F1F2',        // main background
  primary: '#4B6DEB',        // vibrant blue
  primaryDark: '#3d5bd4',
  mint: '#6DEBB9',           // mint green
  teal: '#3D6D70',           // dark teal
  lavender: '#9CA5B7',       // muted lavender
  muted: '#9CA5B7',
} as const

export const GRADIENT = 'linear-gradient(135deg, #4B6DEB 0%, #3D6D70 50%, #6DEBB9 100%)'
export const GRADIENT_SHADOW = '0 4px 14px 0 rgba(75, 109, 235, 0.3)'
