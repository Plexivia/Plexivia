import * as React from "react"
import { cn } from "@/lib/utils"

export function TooltipProvider({ children }) {
  return <>{children}</>
}

export function Tooltip({ children, open, defaultOpen, onOpenChange, ...props }) {
  const [isOpenState, setIsOpenState] = React.useState(defaultOpen || false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : isOpenState
  const timeoutRef = React.useRef(null)

  const handleOpen = () => {
    clearTimeout(timeoutRef.current)
    if (!isControlled) setIsOpenState(true)
    onOpenChange?.(true)
  }

  const handleClose = () => {
    clearTimeout(timeoutRef.current)
    if (!isControlled) setIsOpenState(false)
    onOpenChange?.(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen })
        }
        return child
      })}
    </div>
  )
}

export function TooltipTrigger({ children, render, asChild, isOpen, ...props }) {
  if (render) {
    return React.isValidElement(render) ? React.cloneElement(render, props) : render
  }
  return (
    <div className="inline-flex cursor-pointer select-none" {...props}>
      {children}
    </div>
  )
}

export function TooltipContent({
  children,
  isOpen,
  side = "top",
  sideOffset = 4,
  align = "center",
  className,
  ...props
}) {
  if (!isOpen) return null

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
    "inline-start": "right-full top-1/2 -translate-y-1/2 mr-1.5",
    "inline-end": "left-full top-1/2 -translate-y-1/2 ml-1.5",
  }

  return (
    <div
      data-slot="tooltip-content"
      role="tooltip"
      className={cn(
        "absolute z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95 whitespace-nowrap pointer-events-none",
        positions[side] || positions.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Tooltip
