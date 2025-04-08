'use client'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import theme from '@/theme'
import { AuthProvider } from '@/utils/AuthContext'

export function Provider({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </ThemeProvider>
  )
}

