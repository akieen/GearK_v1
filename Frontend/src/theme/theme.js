import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#E30019',
      hover: '#C40015',
      dark: '#990010',
      light: '#FEE2E2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F172A',
      light: '#1E293B',
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#2563EB',
      light: '#DBEAFE',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontWeight: 900,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '1.75rem',
      lineHeight: 1.25,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontWeight: 800,
      fontSize: '1.375rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 700,
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.84375rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#F4F5F7',
          color: '#111827',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
        },
        '::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '::-webkit-scrollbar-track': {
          background: '#F1F5F9',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#CBD5E1',
          borderRadius: 4,
          '&:hover': {
            background: '#94A3B8',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 8,
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          backgroundColor: '#E30019',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C40015',
            boxShadow: '0 6px 18px rgba(227, 0, 25, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
        },
        elevation2: {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.07)',
          border: '1px solid #E5E7EB',
        },
        elevation3: {
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9CA3AF',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E30019',
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 6,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          fontSize: '0.8125rem',
          color: '#4B5563',
          backgroundColor: '#F8FAFC',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #E2E8F0',
        },
        body: {
          fontSize: '0.875rem',
          color: '#111827',
          borderBottom: '1px solid #F1F5F9',
        },
      },
    },
  },
});

export default theme;
