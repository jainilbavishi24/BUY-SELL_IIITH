import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    accent: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        transition: 'all 0.3s ease',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
        transition: 'all 0.2s',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        }),
        gradient: {
          bgGradient: 'linear(to-r, brand.400, accent.400)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.500, accent.500)',
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          },
        },
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderRadius: 'xl',
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'lg',
          transition: 'all 0.3s ease',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: props.colorMode === 'dark' ? '2xl' : 'xl',
          },
        },
      }),
    },
    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
            borderRadius: 'lg',
            _hover: {
              bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            },
            _focus: {
              bg: props.colorMode === 'dark' ? 'gray.600' : 'white',
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
            },
          },
        }),
      },
    },
  },
});

export default theme;
