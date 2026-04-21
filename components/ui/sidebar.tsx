"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used inside <SidebarProvider>")
  }

  return context
}

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(true)

  const toggleSidebar = () => setOpen((prev) => !prev)

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
      }}
    >
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { open } = useSidebar()

  return (
    <aside
      className={cn(
        "border-r bg-background text-foreground transition-all duration-300",
        open ? "w-64" : "w-16",
        className
      )}
      {...props}
    />
  )
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-16 border-b px-4 flex items-center font-semibold text-lg",
        className
      )}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1 p-2", className)} {...props} />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto border-t p-2", className)} {...props} />
  )
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  isActive?: boolean
}

export function SidebarMenuButton({
  className,
  asChild = false,
  isActive = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all",
        isActive
          ? "bg-green-600 text-white hover:bg-green-700"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-background hover:bg-muted transition",
        className
      )}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
    </button>
  )
}

export function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn(
        "flex-1 bg-muted/30 min-h-screen overflow-auto",
        className
      )}
      {...props}
    />
  )
}