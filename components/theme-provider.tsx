"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false)

  // useEffect cuma jalan di browser setelah render pertama selesai
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Selama di server atau sebelum hydration selesai, 
  // jangan pake NextThemesProvider dulu biar gak error script tag
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemesProvider 
      {...props} 
      enableSystem={true} 
      attribute="class"
      enableColorScheme={false} // <--- MATIKAN INI, biang kerok script tag!
    >
      {children}
    </NextThemesProvider>
  )
}