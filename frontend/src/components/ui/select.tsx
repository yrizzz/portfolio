"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  const [displayValue, setDisplayValue] = React.useState("")

  React.useEffect(() => {
    // Find the selected item's text
    const items = document.querySelectorAll('[data-select-item]')
    items.forEach((item) => {
      if (item.getAttribute('data-value') === value) {
        setDisplayValue(item.textContent || "")
      }
    })
  }, [value])

  return <span>{displayValue || placeholder || "Select..."}</span>
}

export function SelectContent({ children }: SelectContentProps) {
  const { open, setOpen } = React.useContext(SelectContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      data-select-item
      data-value={value}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </div>
  )
}

export const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="py-1.5 pl-2 pr-2 text-sm font-semibold">{children}</div>
)
export const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-muted" />
