'use client'

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import theme from '@/theme'

export function Provider({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        {children}
      </ChakraProvider>
    </ThemeProvider>
  )
}

