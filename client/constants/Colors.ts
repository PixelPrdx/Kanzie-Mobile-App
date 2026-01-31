type GradientType = readonly [string, string, ...string[]];

const tintColorLight = '#8b5cf6'; // Violet 500
const tintColorDark = '#a78bfa';  // Violet 400

export const Colors = {
  light: {
    text: '#1e293b',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    card: '#f8fafc',
    accent: '#f97316', // Orange 500
    success: '#10b981',
    error: '#ef4444',
    border: '#e2e8f0',
    headerGradient: ['#8b5cf6', '#a78bfa'] as GradientType,
    primaryGradient: ['#8b5cf6', '#f97316'] as GradientType,
    accentGradient: ['#f97316', '#fb923c'] as GradientType,
    glass: 'rgba(255, 255, 255, 0.7)',
  },
  dark: {
    text: '#ffffff',
    background: '#09090b', // Zinc 950
    tint: tintColorDark,
    tabIconDefault: '#71717a',
    tabIconSelected: tintColorDark,
    card: '#18181b', // Zinc 900
    accent: '#fb923c', // Orange 400
    success: '#34d399',
    error: '#f87171',
    border: '#27272a',
    headerGradient: ['#6d28d9', '#8b5cf6'] as GradientType,
    primaryGradient: ['#8b5cf6', '#f97316'] as GradientType,
    accentGradient: ['#fb923c', '#fdba74'] as GradientType,
    glass: 'rgba(24, 24, 27, 0.7)',
  },
};

export default Colors;

