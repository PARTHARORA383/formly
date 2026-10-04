"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// The theme changes only through the toggle button in the header. There is
// deliberately no keyboard shortcut for it.
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
